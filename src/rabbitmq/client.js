/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

const { connect } = require("amqplib");
const { logger } = require("../logger");

const amqpUrl = process.env.RABBITMQ_URL;

/**
 * RabbitMQ config object
 * */
const config = {
  exchange: {
    name: "events",
    type: "topic",
    options: {
      durable: false,
      autoDelete: true
    }
  },
  queue: {
    name: "",
    options: {
      autoDelete: true,
      exclusive: true
    }
  },
  channel: {
    noAck: true
  }
};

/**
 * Return the connection, creates the connection if it does not exist.
 * @return {Promise}
 */
const getConnection = (() => {
  let connection = null;
  return () => {
    return new Promise((resolve, reject) => {
      if (!connection) {
        return connect(`${amqpUrl}?heartbeat=60`)
          .then(conn => {
            connection = conn;
            return resolve(connection);
          })
          .catch(e => reject(e));
      } else {
        return resolve(connection);
      }
    });
  };
})();

/**
 * Return the user channel
 * @return {{removeClient: (function(*=): PromiseLike<boolean> | Promise<boolean>), get: get}}
 */
const channels = (() => {
  let chs = {};
  let pendingChannels = {};

  /**
   * Remove client
   * @param client_id
   * @return {PromiseLike<boolean> | Promise<boolean>}
   */
  const removeClient = client_id => {
    if (!chs[client_id]) {
      return Promise.resolve();
    }

    const client = get(client_id);

    delete chs[client_id];

    return client.then(channel => {
      logger.debug(`rabbitmq-channel-close client_id: ${client_id}`)
      channel.close();
      return true;
    });
  };

  /**
   * Get client
   * @param client_id   Id of client
   * @return {Promise}
   */
  const get = client_id => {
    if (pendingChannels[client_id]) {
      return pendingChannels[client_id];
    }
    pendingChannels[client_id] = new Promise((resolve, reject) => {
      if (!chs[client_id]) {
        return getConnection()
          .then(connection => {
            logger.debug(`rabbitmq-channel-create client_id: ${client_id}`)
            return connection.createChannel();
          })
          .then(channel => {
            chs[client_id] = channel;
            return resolve(chs[client_id]);
          });
      } else {
        return resolve(chs[client_id]);
      }
    });
    return pendingChannels[client_id].then(ch => {
      delete pendingChannels[client_id];
      return ch;
    });
  };
  return {
    removeClient: removeClient,
    get: get
  };
})();

/**
 * Return a new queue
 * @return {{create: (function(*=, *, *): Promise)}}
 */
const queues = (() => {
  /**
   * Get exchange
   * @param channel
   * @return {{durable: (boolean|*), internal: boolean, ticket: number, autoDelete: boolean, exchange: *, arguments: null, type: *, passive: boolean, nowait: boolean}}
   */
  const getExchange = channel => {
    return channel.assertExchange(
      config.exchange.name,
      config.exchange.type,
      config.exchange.options
    );
  };

  /**
   * Getting Queue
   * @param channel
   * @return { Promise }
   */
  const getQueue = channel => {
    return channel
      .assertQueue(config.queue.name, config.queue.options)
      .then(qok => {
        return qok.queue;
      });
  };
  return {
    create: (channel, client_id, routing_key) => {
      return getExchange(channel).then(exchange => {
        return getQueue(channel);
      });
    }
  };
})();

const subscriptions = (() => {
  let subs = {};

  /**
   * Binding to Queue
   * @param channel
   * @param queue
   * @param routing_key
   * @param cb
   * @return {Buffer|{noLocal, consumerTag, ticket: number, noAck, exclusive, arguments: *, queue: *, nowait: boolean}}
   */
  const bindAndSubscribe = (channel, queue, routing_key, cb) => {
    channel.bindQueue(queue, config.exchange.name, routing_key);
    return channel.consume(queue, cb, {
      noAck: config.channel.noAck
    });
  };

  /**
   * Register new subscription
   * @param client_id
   * @param routing_key
   * @param consumerTag
   * @return {*}
   */
  const registerSubscription = (client_id, routing_key, consumerTag) => {
    subs[client_id] = subs[client_id] || {};
    return (subs[client_id][routing_key] = consumerTag);
  };

  /**
   * Subscribe to topic
   * @param client_id
   * @param routing_key
   * @param cb
   * @return { Promise }
   */
  const subscribe = (client_id, routing_key, cb) => {
    return channels.get(client_id).then(channel => {
      return queues
        .create(channel)
        .then(queue => {
          return bindAndSubscribe(channel, queue, routing_key, cb);
        })
        .then(ok => {
          return registerSubscription(client_id, routing_key, ok.consumerTag);
        });
    });
  };

  /**
   * Unsubscribe from topic
   * @param client_id
   * @param routing_key
   * @return { Promise }
   */
  const unsubscribe = (client_id, routing_key) => {
    return channels.get(client_id).then(channel => {
      const consumerTag = subs[client_id][routing_key];
      if (consumerTag !== void 0) {
        return channel.cancel(consumerTag);
      }
    });
  };

  /**
   * Remove client
   * @param client_id
   * @return {boolean}
   */
  const removeClient = client_id => {
    return delete subs[client_id];
  };

  return {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    removeClient: removeClient
  };
})();

/**
 * Destroy client connection
 * @param client_id
 * @return {*}
 */
const destroy = client_id => {
  subscriptions.removeClient(client_id);
  return channels.removeClient(client_id);
};

module.exports = {
  subscribe: subscriptions.subscribe,
  unsubscribe: subscriptions.unsubscribe,
  destroy,
  getConnection
};

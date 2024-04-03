/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

const { v4 } = require("uuid");

const { SubscriptionManager } = require("../rabbitmq");
const { logger } = require("../logger");
const { getUserId, verify } = require("../crypto");

let clients = {};

/**
 * Common WS client
 */
class Client {
  /**
   * @constructor
   * @param ws  WebSocket instance
   */
  constructor(ws) {
    this.ws = ws;
    this.id = v4();
    this.handleEvents();
  }

  /**
   * Events handler
   * @return {*}
   */
  handleEvents() {
    this.ws.on("message", this.handleMessage.bind(this));
    return this.ws.on("error", this.handleError);
  }

  /**
   * Error handler
   * @param error
   * @return {*}
   */
  handleError(error) {
    const { headers } = this.ws.upgradeReq;
    logger.error(
      "evt=client_errorx_forwarded_for=%s",
      headers["x-forwarded-for"]
    );
    return logger.error(error);
  }

  /**
   * Messages handler
   * @param message
   * @return {null|{sessionId}|{token}|*}
   */
  handleMessage(message) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch {
      logger.error(`Error parsing message: ${message}`);
      return null;
    }

    if (msg.cmd === "ping") {
      logger.debug(`PING: ${message}`);
      return this.sendPong();
    } else {
      logger.info(`${msg.cmd}: ${message}`);
      if (msg.cmd === "auth" && msg.data) {
        return this.authUser(msg.data);
      } else if (msg.cmd === "subscribe" && msg.routing_key) {
        if (this.auth && msg.routing_key.indexOf("live_notifications") === 0) {
          const userId = getUserId(this.auth.token);
          if (userId) {
            return this.addSubscription(`live_notifications.${userId}`);
          }
        } else {
          return this.addSubscription(msg.routing_key, msg.options);
        }
      } else if (msg.cmd === "unsubscribe" && msg.routing_key) {
        return this.removeSubscription(msg.routing_key);
      }
    }
  }

  /**
   * Auth user
   * @param auth
   * @return {{sessionId}|{token}|*}
   */
  authUser(auth) {
    if (auth.token && auth.sessionId && verify(auth.token)) {
      return (this.auth = auth);
    }
  }

  /**
   * Register client
   * @param routing_key
   * @param options
   * @return {*}
   */
  addSubscription(routing_key, options) {
    if (this.auth) {
      if (!this.subscriptionManager) {
        this.subscriptionManager = new SubscriptionManager(
          this.id,
          this.auth,
          this.ws
        );
      }
      return this.subscriptionManager.add(routing_key, options);
    }
  }

  /**
   * Unregister client
   * @param routing_key
   * @return {*}
   */
  removeSubscription(routing_key) {
    if (this.subscriptionManager) {
      return this.subscriptionManager.remove(routing_key);
    }
  }

  /**
   * Sending Pong event to client
   * @return {*}
   */
  sendPong() {
    try {
      return this.ws.send(
        JSON.stringify({
          cmd: "pong"
        })
      );
    } catch (error) {
      return logger.error(error);
    }
  }

  /**
   * Close connections
   */
  close() {
    if (this.subscriptionManager) {
      return this.subscriptionManager.destroy();
    }
  }
}

/**
 * Creating new client with onClose listener
 * @param ws
 * @return {*}
 */
const createClient = ws => {
  const client = new Client(ws);
  clients[client.id] = client;
  logger.info(`ws-connection-open: ${client.id}`);

  return client.ws.on("close", function() {
    client.close();
    logger.info(`ws-connection-close: ${client.id}`);
    return delete clients[client.id];
  });
};

module.exports = { createClient };

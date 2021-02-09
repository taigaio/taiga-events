/*
 * Copyright (C) 2014-present Taiga Agile LLC
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: ws/client.js
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
          return this.addSubscription(msg.routing_key);
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
   * @return {*}
   */
  addSubscription(routing_key) {
    if (this.auth) {
      if (!this.subscriptionManager) {
        this.subscriptionManager = new SubscriptionManager(
          this.id,
          this.auth,
          this.ws
        );
      }
      return this.subscriptionManager.add(routing_key);
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

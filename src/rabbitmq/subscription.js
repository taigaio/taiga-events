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
 * File: rabbitmq/subscription.js
 */

const { subscribe, unsubscribe } = require("./client");
const { logger } = require("../logger");

/**
 * Events subscriptions
 */
class Subscription {
  /**
   * @constructor
   * @param client_id   Id of client
   * @param auth        Auth object
   * @param ws          WS object
   * @param routing_key Router Id
   */
  constructor(client_id, auth, ws, routing_key) {
    this.client_id = client_id;
    this.auth = auth;
    this.ws = ws;
    this.routing_key = routing_key;
  }

  /**
   * Messages handler
   * @param msg Message object
   * @return {void|*}
   */
  handleMessage(msg) {
    const content = JSON.parse(msg.content.toString());
    if (content.session_id === this.auth.sessionId) {
      return;
    }
    const clientMsg = content;
    clientMsg.routing_key = msg.fields.routingKey;

    const clientMsgStr = JSON.stringify(clientMsg);
    try {
      return this.ws.send(clientMsgStr);
    } catch (error) {
      logger.error(`error sending: ${clientMsgStr}`);
      return logger.error(`error: ${error}`);
    }
  }

  /**
   * Start new subscription
   * @return {*}
   */
  start() {
    return subscribe(
      this.client_id,
      this.routing_key,
      this.handleMessage.bind(this)
    );
  }

  /**
   * Subscription stopping
   * @return {*}
   */
  stop() {
    return unsubscribe(this.client_id, this.routing_key);
  }
}

module.exports = { Subscription };

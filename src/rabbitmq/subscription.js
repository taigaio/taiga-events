/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
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

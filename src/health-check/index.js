/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

const WebSocket = require("ws");

const { getConnection } = require("../rabbitmq");

/**
 * Checking WebSocket server status
 * @return {Promise<string>}
 */
const webSocketServerProbe = () =>
  new Promise((resolve, reject) => {
    const client = new WebSocket(
      `ws://localhost:${process.env.WEB_SOCKET_SERVER_PORT}`
    );

    client.on("open", function() {
      client.close();
      resolve("WebSocket server is alive");
    });

    client.on("error", function() {
      reject("WebSocket server is down");
    });
  });

/**
 * Checking RabbitMQ status
 * @return {Promise<string>}
 * @constructor
 */
const RabbitMQProbe = () =>
  new Promise(async (resolve, reject) => {
    try {
      await getConnection();
      resolve("RabbitMQ server is alive");
    } catch (e) {
      // console.log(e);
      reject("RabbitMQ server is down");
    }
  });

module.exports = { webSocketServerProbe, RabbitMQProbe };

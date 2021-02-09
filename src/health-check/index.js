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
 * File: health-check/index.js
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

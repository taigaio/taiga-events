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
      this.close();
      resolve("WebSocket server is alive");
    });

    client.on("error", () => {
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

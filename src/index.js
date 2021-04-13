/**
 * Configuration loading from .env
 */
require("dotenv").config();

const { Server } = require("ws");
const { createServer } = require("http");
const { httpEndoscope, endoscopeInstance } = require("endoscope");

const { logger } = require("./logger");
const { createClient } = require("./ws");
const { webSocketServerProbe, RabbitMQProbe } = require("./health-check");

const serverConfig = {
  port: process.env.WEB_SOCKET_SERVER_PORT
};

/**
 * WS server initializations
 */
const wss = new Server(serverConfig, () => {
  logger.info("WS server is started");
});

/**
 * WS server connections listener
 */
wss.on("connection", ws => {
  return createClient(ws);
});

/**
 * WS server error listener
 */
wss.on("error", error => {
  logger.warn(error.message);
});

const endposcopeConfig = {
  prefix: "/healthz",
  successCode: 200,
  errorCode: 500,
  defaultLevel: 0
};

endoscopeInstance.register(webSocketServerProbe, { timeout: 500 });
endoscopeInstance.register(RabbitMQProbe, { timeout: 500 });

/**
 * HTTP server initialization (for checking liveness | readiness probe)
 */
createServer(httpEndoscope(endposcopeConfig)).listen(
  process.env.APP_PORT,
  app => {
    logger.info(
      `Liveness / Readiness server was started in http://localhost:${process.env.APP_PORT}/healthz`
    );
  }
);

/**
 * Default NodeJS Uncaught Exception and Unhandled Rejection handlers
 */
process.on("uncaughtException", err => {
  logger.warn(`Uncaught Exception: "${err}"`);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  logger.warn(`Unhandled Rejection: "${err}"`);
  process.exit(1);
});

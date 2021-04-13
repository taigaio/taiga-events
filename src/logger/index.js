const { format, createLogger, transports } = require("winston");

const { combine, timestamp, json, printf } = format;

/**
 * Preparing Winston Logger for different environments
 */
let transportsList = [];
let formatObject;

if (process.env.NODE_ENV === "production") {
  transportsList.push(
    new transports.Console({
      level: "info",
      handleExceptions: true,
      json: true
    })
  );
  formatObject = combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    json()
  );
} else {
  transportsList.push(
    new transports.Console({
      level: "silly",
      handleExceptions: true,
      json: false
    })
  );

  formatObject = combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    printf(
      info =>
        `[${info.level.toUpperCase()}] - [${info.timestamp}]: ${info.message}`
    )
  );
}

/**
 * Winston logger initialization
 */
const logger = createLogger({
  defaultMeta: { service: "taiga-events" },
  format: formatObject,
  transports: transportsList
});

module.exports = { logger };

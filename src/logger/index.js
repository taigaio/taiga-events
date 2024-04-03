/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

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
      level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : "info",
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
      level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : "silly",
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

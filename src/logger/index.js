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
 * File: logger/index.js
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

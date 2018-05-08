winston = require 'winston'

simplestFormat = winston.format.printf((info) =>
    "#{info.timestamp} #{info.level} #{info.message}")

logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        simplestFormat
    ),
    transports: [
        new winston.transports.Console({
          level: "debug",
          handleExceptions: true,
          json: false,
          colorize: true
    })
    ],
});

exports.logger = logger

winston = require 'winston'
webSocket = require 'ws'

eventsConfig = require('./events-config')
argv = require('minimist')(process.argv.slice(2))
eventsConfig.loadConfigFile(argv.config || './config')
config = eventsConfig.config

client = require './client'

WebSocketServer = webSocket.Server

simplestFormat = winston.format.printf((info) =>
    "#{info.timestamp} #{info.message}")

logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        simplestFormat
    ),
    transports: [
        new winston.transports.Console(config.loggerOptions)
    ],
    exitOnError: false,
});

wss = new WebSocketServer(config.webSocketServer)

wss.on 'connection', (ws) ->
    client.createClient(ws)

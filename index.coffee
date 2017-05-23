eventsConfig = require('./events-config')
argv = require('minimist')(process.argv.slice(2));

eventsConfig.loadConfigFile(argv.config || './config')

config = eventsConfig.config;

client = require('./client')

WebSocketServer = require('ws').Server
wss = new WebSocketServer(config.webSocketServer)

wss.on 'connection', (ws) ->
    client.createClient(ws)

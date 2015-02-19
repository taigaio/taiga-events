config = require('./config')
client = require('./client')

WebSocketServer = require('ws').Server
wss = new WebSocketServer(config.webSocketServer)

wss.on 'connection', (ws) ->
    client.createClient(ws)

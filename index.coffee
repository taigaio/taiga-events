amqp = require('amqp')
uuid = require('node-uuid')

config = require('./config')
clients = require('./clients')

connection = amqp.createConnection({ url: config.url }, {defaultExchangeName: config.exchange.name})

WebSocketServer = require('ws').Server
wss = new WebSocketServer(config.webSocketServer)

connection.on 'ready',  () ->
    connection.queue config.queue.name, config.queue.options, (q) ->
        console.log 'Queue ' + q.name + ' is open'

        exc = connection.exchange config.exchange.name, config.exchange.options, (exchange) ->
            console.log 'Exchange ' + exchange.name + ' is open'

            q.bind(config.exchange.name, '#')

            q.subscribe (msg, header, deliveryInfo) ->
                msg = JSON.parse(msg.data.toString())

                clientMsg = msg.data
                clientMsg.routing_key = deliveryInfo.routingKey

                senderClient = clients.getBySessionId(msg.session_id)
                subscriptions = clients.getBySubscription(deliveryInfo.routingKey)

                clientMsgStr = JSON.stringify(clientMsg)

                subscriptions.forEach (client) ->
                    #exclude sender client
                    if !senderClient || client.id != senderClient.id
                        client.ws.send clientMsgStr

wss.on 'connection', (ws) ->
    clientId = uuid.v4()

    ws.on 'message', (message) ->
        msg = JSON.parse(message)

        if msg.cmd == 'auth'
            clients.add({
                id: clientId,
                ws: ws,
                auth: msg.data
            })
        else if msg.cmd == 'subscribe'
            clients.addSubscription(clientId, msg.routing_key)
        else if msg.cmd == 'unsubscribe'
            clients.removeSubscription(clientId, msg.routing_key)

    ws.on 'close', (message) ->
        clients.removeById(clientId)

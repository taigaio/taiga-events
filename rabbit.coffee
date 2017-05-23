amqp = require('amqplib')
Promise = require('bluebird')
amqpUrl = require('./events-config').config.url

config = {
    "exchange": {
        "name": "events",
        "type": "topic",
        "options": {
            "durable": false,
            "autoDelete": true
        }
    },
    "queue": {
        "name": ""
        "options": {
            "autoDelete": true,
            "exclusive": true
        }
    },
    "channel": {
        noAck: true
    }
}

# Return the connection, creates the connection if it does not exist.
getConnection = do ->
    connection = null

    return () ->
        return new Promise (resolve, reject) ->
            if (!connection)
                amqp.connect(amqpUrl).then (conn) ->
                    connection = conn
                    resolve(connection)
            else
                resolve(connection)

# Return the user channel
channels = do ->
    chs = {}
    pendingChannels = {}

    removeClient = (client_id) ->
        get(client_id).then (channel) ->
            channel.close()

            delete chs[client_id]

    get = (client_id) ->
        if pendingChannels[client_id]
            return pendingChannels[client_id]

        pendingChannels[client_id] = new Promise (resolve, reject) ->
            if !chs[client_id]
                getConnection()
                    .then (connection) -> connection.createChannel()
                    .then (channel) ->
                        chs[client_id] = channel
                        return resolve(chs[client_id])
            else
                resolve(chs[client_id])

        return pendingChannels[client_id].then (ch) ->
            delete pendingChannels[client_id]

            return ch

    return {
        removeClient: removeClient
        get: get
    }

# Return a new queue
queues = do ->
    getExchange = (channel) ->
        return channel.assertExchange(config.exchange.name, config.exchange.type, config.exchange.options)

    getQueue = (channel, exchange) ->
        return channel.assertQueue(config.queue.name, config.queue.options).then (qok) -> qok.queue

    return {
        create: (channel, client_id, routing_key) ->
            return getExchange(channel)
                .then (exchange) -> getQueue(channel)
    }

subscriptions = do ->
    subs = {}

    bindAndSubscribe = (channel, queue, routing_key, cb) ->
        channel.bindQueue(queue, config.exchange.name, routing_key)
        return channel.consume(queue, cb, {noAck: true})

    registerSubscription = (client_id, routing_key, consumerTag) ->
        subs[client_id] = subs[client_id] || {}
        subs[client_id][routing_key] = consumerTag

    subscribe = (client_id, routing_key, cb) ->
        channels.get(client_id)
            .then (channel) ->
                queues.create(channel)
                    .then (queue) -> bindAndSubscribe(channel, queue, routing_key, cb)
                    .then (ok) -> registerSubscription(client_id, routing_key, ok.consumerTag)

    unsubscribe = (client_id, routing_key) ->
        channels.get(client_id).then (channel) ->
            consumerTag = subs[client_id][routing_key]
            if consumerTag != undefined
                channel.cancel(consumerTag)

    removeClient = (client_id) ->
        delete subs[client_id]

    return {
        subscribe: subscribe
        unsubscribe: unsubscribe
        removeClient: removeClient
    }

exports.destroy = (client_id) ->
    subscriptions.removeClient(client_id)
    channels.removeClient(client_id)

exports.subscribe = subscriptions.subscribe
exports.unsubscribe = subscriptions.unsubscribe

uuid = require('node-uuid')
signing = require('./signing')
SubscriptionManager = require('./subscription').SubscriptionManager

clients = {}

class Client
    constructor: (@ws) ->
        @id = uuid.v4()

        @handleEvents()

    handleEvents: () ->
        @ws.on 'message', @handleMessage.bind(@)

    handleMessage: (message) ->
        msg = JSON.parse(message)

        if msg.cmd == 'auth'
            @auth(msg.data)
        else if msg.cmd == 'subscribe'
            @addSubscription(msg.routing_key)
        else if msg.cmd == 'unsubscribe'
            @removeSubscription(msg.routing_key)

    auth: (auth) ->
        if auth.token and auth.sessionId and signing.verify(auth.token)
            @auth = auth

    addSubscription: (routing_key) ->
        if @auth
            if !@subscriptionManager
                @subscriptionManager = new SubscriptionManager(@id, @auth, @ws)
            @subscriptionManager.add(routing_key)

    close: () ->
        if @subscriptionManager
            @subscriptionManager.destroy()

    removeSubscription: (routing_key) ->
        if @subscriptionManager
            @subscriptionManager.remove(routing_key)

exports.createClient = (ws) ->
    client = new Client(ws)
    clients[client.id] = client
    client.ws.on 'close', (() ->
        @.close()
        delete clients[@id]
    ).bind(client)

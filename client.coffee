uuid = require('node-uuid')
signing = require('./signing')
SubscriptionManager = require('./subscription').SubscriptionManager

clients = {}


class Client
    constructor: (@ws) ->
        @.id = uuid.v4()

        @.handleEvents()

    handleEvents: () ->
        @ws.on 'message', @.handleMessage.bind(@)
        @ws.on 'error', @.handleError.bind(@)

    handleError: (error) ->
        req = @ws.upgradeReq
        headers = req.headers
        console.log "evt=client_error", "x_forwarded_for=#{headers['x-forwarded-for']}"
        console.log "Error: ", error

    handleMessage: (message) ->
        try
            msg = JSON.parse(message)
        catch e
            return null

        if msg.cmd == 'ping'
            @.sendPong()
        else if msg.cmd == 'auth' and msg.data
            @.authUser(msg.data)
        else if msg.cmd == 'subscribe' and msg.routing_key
            @.addSubscription(msg.routing_key)
        else if msg.cmd == 'unsubscribe' and msg.routing_key
            @.removeSubscription(msg.routing_key)

    authUser: (auth) ->
        if auth.token and auth.sessionId and signing.verify(auth.token)
            @.auth = auth

    addSubscription: (routing_key) ->
        if @.auth
            if !@.subscriptionManager
                @.subscriptionManager = new SubscriptionManager(@.id, @.auth, @ws)
            @.subscriptionManager.add(routing_key)

    removeSubscription: (routing_key) ->
        if @.subscriptionManager
            @.subscriptionManager.remove(routing_key)

    sendPong: ->
        try
            @ws.send(JSON.stringify({cmd: "pong"}))
        catch e
            console.error("Error: ", e)

    close: () ->
        if @.subscriptionManager
            @.subscriptionManager.destroy()


exports.createClient = (ws) ->
    client = new Client(ws)
    clients[client.id] = client
    client.ws.on 'close', (() ->
        @.close()
        delete clients[@.id]
    ).bind(client)

queue = require('./rabbit')


class Subscription
    constructor: (@client_id, @auth, @ws, @routing_key) ->

    handleMessage: (msg) ->
        content = JSON.parse(msg.content.toString())

        if content.session_id == @auth.sessionId
            return

        clientMsg = content
        clientMsg.routing_key = msg.fields.routingKey
        clientMsgStr = JSON.stringify(clientMsg)

        try
            @ws.send clientMsgStr
        catch e
            console.error("Error: ", e)

    start: () ->
        queue.subscribe(@client_id, @routing_key, @.handleMessage.bind(@))

    stop: () ->
        queue.unsubscribe(@client_id, @routing_key)


class SubscriptionManager
    constructor: (@client_id, @auth, @ws) ->
        @.subscriptions = {}

    add: (routing_key) ->
        if !@.subscriptions[routing_key]
            @.subscriptions[routing_key] = {}
        else
            @.subscriptions[routing_key].stop()

        @.subscriptions[routing_key] = new Subscription(@client_id, @auth, @ws, routing_key)
        @.subscriptions[routing_key].start()

    remove: (routing_key) ->
        if @.subscriptions[routing_key] && @.subscriptions[routing_key].stop
            @.subscriptions[routing_key].stop()

            delete @.subscriptions[routing_key]

    destroy: () ->
        @.subscriptions = {}
        queue.destroy(@client_id)

exports.SubscriptionManager = SubscriptionManager

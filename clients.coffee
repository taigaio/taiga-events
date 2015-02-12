clients = []
subscriptions = {}

removeSubscription = (id, routing_key) ->
    if subscriptions[routing_key]
        subscriptions[routing_key] = subscriptions[routing_key].filter (client) -> client.id != id

exports.removeById = (id) ->
    clients = clients.filter (client) -> client.id != id

    Object.keys(subscriptions).forEach (routing_key) ->
        removeSubscription(id, routing_key)

exports.getBySessionId = (session_id) ->
    client = clients.filter (client) -> client.auth.sessionId == session_id

    return client[0]

exports.add = (client) ->
    clients.push(client)

exports.addSubscription = (id, routing_key) ->
    if !subscriptions[routing_key]
        subscriptions[routing_key] = []

    client = clients.filter (client) -> client.id == id

    subscriptions[routing_key].push(client[0])

exports.removeSubscription = removeSubscription

exports.getBySubscription = (subscription) ->
    if !subscriptions[subscription]
        return []

    return subscriptions[subscription]

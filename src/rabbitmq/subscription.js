const { subscribe, unsubscribe } = require("./client");

/**
 * Events subscriptions
 */
class Subscription {
  /**
   * @constructor
   * @param client_id   Id of client
   * @param auth        Auth object
   * @param ws          WS object
   * @param routing_key Router Id
   */
  constructor(client_id, auth, ws, routing_key) {
    this.client_id = client_id;
    this.auth = auth;
    this.ws = ws;
    this.routing_key = routing_key;
  }

  /**
   * Messages handler
   * @param msg Message object
   * @return {void|*}
   */
  handleMessage(msg) {
    const content = JSON.parse(msg.content.toString());
    if (content.session_id === this.auth.sessionId) {
      return;
    }
    const clientMsg = content;
    clientMsg.routing_key = msg.fields.routingKey;

    const clientMsgStr = JSON.stringify(clientMsg);
    try {
      return this.ws.send(clientMsgStr);
    } catch (error) {
      return console.error(`Error: ${error}`);
    }
  }

  /**
   * Start new subscription
   * @return {*}
   */
  start() {
    return subscribe(
      this.client_id,
      this.routing_key,
      this.handleMessage.bind(this)
    );
  }

  /**
   * Subscription stopping
   * @return {*}
   */
  stop() {
    return unsubscribe(this.client_id, this.routing_key);
  }
}

module.exports = { Subscription };

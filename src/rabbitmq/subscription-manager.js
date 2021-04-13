const { destroy } = require("./client");
const { Subscription } = require("./subscription");

/**
 * Subscription manager
 */
class SubscriptionManager {
  /**
   * @constructor
   * @param client_id   Id of client
   * @param auth        Auth object
   * @param ws          WebSocket object
   */
  constructor(client_id, auth, ws) {
    this.client_id = client_id;
    this.auth = auth;
    this.ws = ws;
    this.subscriptions = {};
  }

  /**
   * Add new subscription
   * @param routing_key Router Id
   * @return {*}
   */
  add(routing_key) {
    if (!this.subscriptions[routing_key]) {
      this.subscriptions[routing_key] = {};
    } else {
      this.subscriptions[routing_key].stop();
    }
    this.subscriptions[routing_key] = new Subscription(
      this.client_id,
      this.auth,
      this.ws,
      routing_key
    );
    return this.subscriptions[routing_key].start();
  }

  /**
   * Remove subscription by route key
   * @param routing_key   oOuter Id
   * @return {boolean}
   */
  remove(routing_key) {
    if (
      this.subscriptions[routing_key] &&
      this.subscriptions[routing_key].stop
    ) {
      this.subscriptions[routing_key].stop();
      return delete this.subscriptions[routing_key];
    }
  }

  /**
   * Destroy all subscriptions
   * @return {*}
   */
  destroy() {
    this.subscriptions = {};
    return destroy(this.client_id);
  }
}

module.exports = { SubscriptionManager };

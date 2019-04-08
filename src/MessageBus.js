
class MessageBus {
  constructor() {
    this._subscribers = {
      plain: {},
      regexp: {},
      wildcard: { '*': [] },
    }
  }

  /**
   * @param {String} type
   * @param {Mixed String|RegExp} pattern
   * @return {Array}
   */
  _getSubscribers(type, pattern) {
    if (typeof this._subscribers[type][pattern] === 'undefined') {
      this._subscribers[type][pattern] = [];
    }

    return this._subscribers[type][pattern]
  }

  /**
   * @param {String} actionType
   * @return {Array}
   */
  _getRegExpSubscribers(actionType) {
    const regexps = Object.keys(this._subscribers.regexp)
    if (regexps.length === 0) {
      return []
    }

    return regexps
      .filter(regexp =>
        (new RegExp(regexp.source, regexp.flags)).test(actionType)
      )
      .map(key => this._subscribers.regexp[key])
      .reduce((acc = [], item) => acc.concat(item))
  }

  /**
   * @param {Object} context
   * @return {Object}
   */
  _bindBus(context) {
    if(typeof context === 'undefined') {
      context = {}
    }

    return Object.assign({}, context, { bus: this })
  }


  /**
   * @param {Object|String} Whole action object or action type as string
   * @param {Object} [payload]
   * @param {Object} [meta]
   * @return {Object} Action
   */
  _parsePublishedAction(type, payload, meta) {
    switch(typeof type) {
      case 'string':
        return { type, payload, meta }

      case 'object':
        return type

      default:
        throw 'First argument should be whole action as an object or action type as a string';
    }
  }

  /**
   * @param {Object} action FSA
   * @return {MessageBus}
   */
  publish(type, payload, meta) {
    const action = this._parsePublishedAction(type, payload, meta)

    const subscribers = [].concat(
      this._getSubscribers('wildcard', '*'),
      this._getSubscribers('plain', action.type),
      this._getRegExpSubscribers(action.type)
    )

    subscribers.forEach(subscriber => {
      setTimeout(() => {
        subscriber.listener.call(subscriber.listener, action, subscriber.context)
      }, 0)
    })

    return this
  }

  /**
   * @param {Mixed String|RegExp} pattern
   * @return {String}
   */
  _getSubscriptionType(pattern) {
    if (pattern === '*') {
      return 'wildcard'
    }

    if (pattern instanceof RegExp) {
      return 'regexp'
    }

    return 'plain'
  }

  /**
   * @param {String} pattern
   * @param {Function} listener
   * @param {Object} context
   * @return {MessageBus}
   */
  subscribe(pattern, listener, context) {
    const type = this._getSubscriptionType(pattern)
    const subscription = {
      listener,
      context: this._bindBus(context),
    }

    this._getSubscribers(type, pattern).push(subscription)

    return this
  }

  /**
   * @param {String} actionType
   * @param {Function} listener
   * @return {MessageBus}
   */
  unsubscribe(actionType, listener) {
    const subscribers = this._getSubscribers(actionType)
    const index = subscribers.findIndex(subscriber =>
      subscriber.listener === listener
    )

    subscribers.splice(index, 1)

    return this
  }
}

module.exports = MessageBus

const MessageBus = require('../../src/MessageBus')


describe('MessageBus', () => {
  describe('_bindBus', () => {
    it('Should add a ref to self in object', () => {
      // Given
      const bus = new MessageBus
      // When
      const context = bus._bindBus({})
      // Then
      expect(context.bus).toBeDefined()
      expect(context.bus).toBe(bus)
    })
  })

  describe('_getSubscribers', () => {
    it('Should return the subscriber array', () => {
      // Given
      const bus = new MessageBus
      const subscription = { foo: 'foo', bar: 'bar' }
      bus._subscribers.plain.FOO = [subscription]
      // When
      const subscribers = bus._getSubscribers('plain', 'FOO')
      // Then
      expect(subscribers).toEqual([subscription])
    })
  })

  describe('_getRegExpSubscribers', () => {
    it('Should return matching subscribers', () => {
      // Given
      const bus = new MessageBus
      const listener = () => {}
      // When
      bus.subscribe(/[FO]+/, listener)
      const subscribers = bus._getRegExpSubscribers('FOO')
      // Then
      expect(subscribers).toEqual([ { listener, context: { bus } }])
    })
  })

  describe('_getSubscriptionType', () => {
    it('Should reconize a regexp', () => {
      // Given
      const bus = new MessageBus
      // When
      const type = bus._getSubscriptionType(/.*/)
      // Then
      expect(type).toBe('regexp')
    })

    it('Should reconize as plainkey', () => {
      // Given
      const bus = new MessageBus
      // When
      const type = bus._getSubscriptionType('foo')
      // Then
      expect(type).toBe('plain')
    })

    it('Should reconize a wild card', () => {
      // Given
      const bus = new MessageBus
      // When
      const type = bus._getSubscriptionType('*')
      // Then
      expect(type).toBe('wildcard')
    })

  })

  describe('subscribe', () => {
    it('Should add an entry in plain subscriber list', () => {
      // Given
      const bus = new MessageBus
      const listener = () => {}
      // When
      bus.subscribe('FOO', listener)
      // Then
      expect(bus._subscribers.plain.FOO).toBeDefined()
      expect(typeof bus._subscribers.plain.FOO).toBe('object');
      expect(Array.isArray(bus._subscribers.plain.FOO)).toBe(true);
      expect(bus._subscribers.plain.FOO.length).toBe(1)
      expect(bus._subscribers.plain.FOO[0]).toEqual({
        listener,
        context: {
          bus,
        }
      })
    })
  })

  describe('publish', () => {
    it('Should call listener with plain subscription', (done) => {
      // Given
      const bus = new MessageBus
      // Expect done() to be called
      const listener = () => done()
      // When
      bus.subscribe('FOO', listener, {})
      bus.publish({ type:'FOO' })
    })

    it('Should call listener with widcard subscription', (done) => {
      // Given
      const bus = new MessageBus
      // Expect done() to be called
      const listener = () => done()
      // When
      bus.subscribe('*', listener, {})
      bus.publish({ type:'FOO' })
    })

    it('Should call listener with regex subscription', (done) => {
      // Given
      const bus = new MessageBus
      // Expect done() to be called
      const listener = () => done()
      // When
      bus.subscribe(/[FO]+/, listener, {})
      bus.publish({ type:'FOO' })
    })

  })

})

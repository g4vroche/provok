import { LocalBus } from "../../src/bus/local-bus";
import { Context } from "../../src/interface/context.interface";
import {
  Subscriber,
  SubscriptionType
} from "../../src/interface/subscription.interface";

describe("LocalBus", () => {
  const subscriberMock: Subscriber = { react: jest.fn() };
  let bus;

  beforeEach(() => {
    bus = new LocalBus([]);
    jest.resetAllMocks();
  });

  describe("bindBus", () => {
    it("Should add a ref to self in object", () => {
      // When
      const context = bus["bindBus"]({} as Context);
      // Then
      expect(context.bus).toBeDefined();
      expect(context.bus).toBe(bus);
    });
  });

  describe("getSubscriptions", () => {
    it("Should return the subscriber array", () => {
      // Given
      const subscription = { foo: "foo", bar: "bar" };
      bus["subscriptions"].plain.FOO = [subscription];
      // When
      const subscribers = bus["getSubscriptions"](
        SubscriptionType.plain,
        "FOO"
      );
      // Then
      expect(subscribers).toEqual([subscription]);
    });
  });

  describe("getRegExpSubscriptions", () => {
    it("Should return matching subscribers", () => {
      // When
      bus.subscribe(/[FO]+/, subscriberMock);
      const subscribers = bus["getRegExpSubscriptions"]("FOO");
      // Then
      expect(subscribers).toEqual([
        { subscriber: subscriberMock, context: { bus } }
      ]);
    });
  });

  describe("getSubscriptionType", () => {
    it("Should reconize a regexp", () => {
      // When
      const type = bus["getSubscriptionType"](/.*/);
      // Then
      expect(type).toBe("regexp");
    });

    it("Should reconize as plainkey", () => {
      // When
      const type = bus["getSubscriptionType"]("foo");
      // Then
      expect(type).toBe("plain");
    });

    it("Should reconize a wild card", () => {
      // When
      const type = bus["getSubscriptionType"]("*");
      // Then
      expect(type).toBe("wildcard");
    });
  });

  describe("subscribe", () => {
    it("Should add an entry in plain subscriber list", () => {
      // When
      bus.subscribe("FOO", subscriberMock);
      // Then
      expect(bus["subscriptions"][SubscriptionType.plain].FOO).toBeDefined();
      expect(typeof bus["subscriptions"][SubscriptionType.plain].FOO).toBe(
        "object"
      );
      expect(
        Array.isArray(bus["subscriptions"][SubscriptionType.plain].FOO)
      ).toBe(true);
      expect(bus["subscriptions"][SubscriptionType.plain].FOO.length).toBe(1);
      expect(bus["subscriptions"][SubscriptionType.plain].FOO[0]).toEqual({
        subscriber: subscriberMock,
        context: {
          bus
        }
      });
    });
  });

  describe("publish", () => {
    it("Should call subscriber with plain subscription", done => {
      // Given
      const subscriber = { react: jest.fn().mockImplementation(() => done()) };
      // When
      bus.subscribe("FOO", subscriber);
      bus.publish({ type: "FOO" });
    });

    it("Should call subscriber with widcard subscription", done => {
      // Given
      const subscriber = { react: jest.fn().mockImplementation(() => done()) };
      // When
      bus.subscribe("*", subscriber);
      bus.publish({ type: "FOO" });
    });

    it("Should call subscriber with regex subscription", done => {
      // Given
      const subscriber = { react: jest.fn().mockImplementation(() => done()) };
      // When
      bus.subscribe(/[FO]+/, subscriber);
      bus.publish({ type: "FOO" });
    });

    it("Should call all subscribers", done => {
      // Given
      let counter = 0;
      const callback = () => {
        if ((counter += 1) === 3) {
          done();
        }
      }
      const subscriber1 = { react: jest.fn().mockImplementation(() => callback()) };
      const subscriber2 = { react: jest.fn().mockImplementation(() => callback()) };
      const subscriber3 = { react: jest.fn().mockImplementation(() => callback()) };
      // When
      bus.subscribe(/[FO]+/, subscriber1);
      bus.subscribe('*', subscriber2);
      bus.subscribe('FOO', subscriber3);
      bus.publish({ type: "FOO" });
    });
  });
});

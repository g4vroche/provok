import { MessageBus, MessageBusHook } from "../interface/messagebus.interface";
import {
  Action,
  ActionType,
  ActionPayload,
  ActionMeta
} from "../interface/action.interface";
import {
  Subscriber,
  Subscription,
  SubscriptionType
} from "../interface/subscription.interface";
import { Context } from "../interface/context.interface";
import { InvalidActionError } from "../exceptions/invalid-action.exception";

interface subscriptionStore {
  [SubscriptionType.plain]: {
    [key: string]: any;
  };
  [SubscriptionType.regexp]: {
    [key: string]: any;
  };
  [SubscriptionType.wildcard]: { "*": any[] };
}

export class LocalBus implements MessageBus {
  private subscriptions: subscriptionStore = {
    [SubscriptionType.plain]: {},
    [SubscriptionType.regexp]: {},
    [SubscriptionType.wildcard]: { "*": [] }
  };

  private readonly actions;
  private hooks = {
    [MessageBusHook.SUBSCRIBE]: [],
    [MessageBusHook.UNSUBSCRIBE]: [],
    [MessageBusHook.PUBLISH]: [],
  };

  constructor(actions, hooks = {}) {
    this.actions = actions;
    this.registerHooks(hooks);
  }

  private registerHooks(hooks) {
    Object.entries(hooks).forEach(([hook, list]) => {
      this.hooks[hook] = list;
    });
  }

  private getSubscriptions(
    type: SubscriptionType,
    pattern: string
  ): Subscription[] {
    if (typeof this.subscriptions[type][pattern] === "undefined") {
      this.subscriptions[type][pattern] = [];
    }

    return this.subscriptions[type][pattern];
  }

  private getRegExpFromString(string: string): RegExp {
    const [, source, flags] = string.split("/");

    return new RegExp(source, flags);
  }

  private getRegExpSubscriptions(actionType: ActionType): Subscription[] {
    const regexps = Object.keys(this.subscriptions.regexp);
    if (regexps.length === 0) {
      return [];
    }

    return regexps
      .map(regexp => this.getRegExpFromString(regexp))
      .filter(regexp => regexp.test(actionType))
      .map(regexp => this.subscriptions.regexp[regexp.toString()])
      .reduce((acc = [], item) => acc.concat(item));
  }

  private getSubscriptionType(pattern: ActionType | RegExp): SubscriptionType {
    if (pattern === "*") {
      return SubscriptionType.wildcard;
    }

    if (pattern instanceof RegExp) {
      return SubscriptionType.regexp;
    }

    return SubscriptionType.plain;
  }

  private bindBus(context?: Context | object): Context {
    let newContext = context ? context : {};

    return { ...newContext, bus: this };
  }

  private isAction(type: ActionType | Action): type is Action {
    return (type as Action).type !== undefined;
  }

  private isActionType(type: ActionType | Action): type is ActionType {
    return this.actions[type] !== undefined;
  }

  private parsePublishedAction(
    type: ActionType | Action,
    payload?: ActionPayload,
    meta?: ActionMeta
  ): Action {
    if (this.isAction(type)) {
      return type;
    }

    if (this.isActionType(type)) {
      return { type, payload, meta };
    }

    throw new InvalidActionError(
      "First argument should be whole action as an object or action type as a string"
    );
  }

  private processHook(hookName: MessageBusHook, args) {
    this.hooks[hookName].forEach(hook => {
      hook.call(this, args);
    });
  }

  public publish(
    typeOrAction: ActionType | Action,
    payload?: ActionPayload,
    meta?: ActionMeta
  ): MessageBus {
    const action: Action = this.parsePublishedAction(
      typeOrAction,
      payload,
      meta
    );

    this.processHook(MessageBusHook.PUBLISH, action);

    const subscriptions: Subscription[] = [].concat(
      this.getSubscriptions(SubscriptionType.wildcard, "*"),
      this.getSubscriptions(SubscriptionType.plain, action.type),
      this.getRegExpSubscriptions(action.type)
    );

    subscriptions.forEach(subscribtion => {
      setTimeout(() => {
        subscribtion.subscriber.react(action, subscribtion.context);
      }, 0);
    });

    return this;
  }

  public subscribe(
    pattern: string | RegExp,
    subscriber: Subscriber,
    context?: Context
  ): MessageBus {
    const type: SubscriptionType = this.getSubscriptionType(pattern);
    const subscription: Subscription = {
      subscriber,
      context: this.bindBus(context)
    };

    this.processHook(MessageBusHook.SUBSCRIBE, { pattern, type, subscription });

    this.getSubscriptions(type, pattern.toString()).push(subscription);

    return this;
  }

  public unsubscribe(pattern: ActionType, subscriber: Subscriber): MessageBus {
    const subscriptions: Subscription[] = [].concat(
      this.getSubscriptions(SubscriptionType.wildcard, "*"),
      this.getSubscriptions(SubscriptionType.plain, pattern),
      this.getRegExpSubscriptions(pattern)
    );

    const index = subscriptions.findIndex(
      subscription => subscription.subscriber === subscriber
    );

    this.processHook(MessageBusHook.UNSUBSCRIBE, { pattern, subscriber, index });

    subscriptions.splice(index, 1);

    return this;
  }
}

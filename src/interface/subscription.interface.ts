import { Action } from "./action.interface";
import { Context } from "./context.interface";

export interface Subscriber {
  react(action: Action, context?: Context): void;
}

export enum SubscriptionType {
  plain = "plain",
  regexp = "regexp",
  wildcard = "wildcard"
}

export interface Subscription {
  subscriber: Subscriber;
  context: Context;
}

import {
  Action,
  ActionType,
  ActionPayload,
  ActionMeta
} from "./action.interface";
import { Subscriber } from "./subscription.interface";

export interface MessageBus {
  publish(
    typeOrAction: ActionType | Action,
    payload?: ActionPayload,
    meta?: ActionMeta
  ): MessageBus;

  subscribe(
    pattern: ActionType | RegExp | string,
    subscriber: Subscriber,
    context?: object
  ): MessageBus;

  unsubscribe(actionType: string, subscriber: Subscriber): MessageBus;
}

export enum MessageBusHook {
  SUBSCRIBE = "SUBSCRIBE",
  UNSUBSCRIBE = "UNSUBSCRIBE",
  PUBLISH = "PUBLISH"
}

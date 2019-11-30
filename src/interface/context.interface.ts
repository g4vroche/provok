import { MessageBus } from './messagebus.interface';

export interface Context {
  bus?: MessageBus,
  [key: string]: any,
}

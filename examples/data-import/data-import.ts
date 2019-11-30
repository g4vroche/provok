import {
  MessageBus,
  MessageBusHook
} from "../../src/interface/messagebus.interface";
import { Subscriber } from "../../src/interface/subscription.interface";
import { LocalBus } from "../../src/bus/local-bus";

import { DataImportActions } from "./data-import.actions";
import { DataFetcher } from "./data-fetcher";
import { DataParser } from "./data-parser";
import { DataSaver } from "./data-saver";

export class DataImport {
  private readonly url: string;
  private readonly bus: MessageBus;
  private readonly done: Subscriber = {
    react: (_action, context) =>
      context.bus.publish(DataImportActions.IMPORT_COMPLETED)
  };

  constructor(url: string) {
    this.url = url;
    this.bus = this.initBus();
    this.register();
  }

  initBus() {
    const hooks = {
      [MessageBusHook.SUBSCRIBE]: [
        data =>
          console.log(`${new Date().toISOString()} - SUB/: ${data.pattern}`)
      ],
      [MessageBusHook.PUBLISH]: [
        data => console.log(`${new Date().toISOString()} - PUB/: ${data.type}`)
      ]
    };

    return new LocalBus(DataImportActions, hooks);
  }

  register() {
    this.bus
      .subscribe(DataImportActions.IMPORT_TRIGGERED, new DataFetcher())
      .subscribe(DataImportActions.DATA_RECEIVED, new DataParser())
      .subscribe(DataImportActions.DATA_PARSED, new DataSaver())
      .subscribe(DataImportActions.DATA_SAVED, this.done);
  }

  run() {
    const action = {
      type: DataImportActions.IMPORT_TRIGGERED,
      payload: { url: this.url },
    };

    this.bus.publish(action);
  }
}

import { MessageBus } from "../../src/interface/messagebus.interface";
import { LocalBus } from "../../src/bus/local-bus";

import { hooks } from "./logger";
import { DataImportActions } from "./data-import.actions";
import { DataFetcher } from "./subscribers/data-fetcher.subscriber";
import { DataParser } from "./subscribers/data-parser.subscriber.";
import { DataSaver } from "./subscribers/data-saver.subscriber.";
import { CleanImpport } from "./subscribers/clean-import.subscriber";

export class DataImport {
  private readonly bus: MessageBus;

  constructor() {
    this.bus = new LocalBus(DataImportActions, hooks);

    this.bus
      .subscribe(DataImportActions.IMPORT_TRIGGERED, new DataFetcher())
      .subscribe(DataImportActions.DATA_RECEIVED, new DataParser())
      .subscribe(DataImportActions.DATA_FETCH_FAILED, new CleanImpport())
      .subscribe(DataImportActions.DATA_PARSED, new DataSaver())
      .subscribe(DataImportActions.DATA_SAVED, new CleanImpport());
  }

  run(url: string) {
    this.bus.publish({
      type: DataImportActions.IMPORT_TRIGGERED,
      payload: { url }
    });
  }
}

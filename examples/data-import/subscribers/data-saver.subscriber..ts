import { Subscriber } from "../../../src/interface/subscription.interface";
import { Action } from "../../../src/interface/action.interface";
import { Context } from "../../../src/interface/context.interface";

import { DataImportActions } from "../data-import.actions";

export class DataSaver implements Subscriber {
  public react(action: Action, context?: Context) {
    const { bus } = context;
    const { data } = action.payload;

    // Save wherver...
    console.log(JSON.stringify(data))

    bus.publish(DataImportActions.DATA_SAVED);
  }
}

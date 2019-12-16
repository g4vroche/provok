import { Subscriber } from "../../../src/interface/subscription.interface";
import { Action } from "../../../src/interface/action.interface";
import { Context } from "../../../src/interface/context.interface";

import { DataImportActions } from "../data-import.actions";

export class DataFetcher implements Subscriber {
  public react(action: Action, context?: Context) {
    const { bus } = context;
    const { url } = action.payload;

    bus.publish(DataImportActions.DATA_REQUESTED, { url });

    // Fetch data via axios, database or whatever...
    const data = `{ "foo": "foo", "bar": "bar" }`;

    bus.publish(DataImportActions.DATA_RECEIVED, { data });
  }
}

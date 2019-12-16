import { Subscriber } from "../../../src/interface/subscription.interface";
import { Action } from "../../../src/interface/action.interface";
import { Context } from "../../../src/interface/context.interface";

import { DataImportActions } from "../data-import.actions";

export class DataParser implements Subscriber {
  public react(action: Action, context?: Context) {
    const { bus } = context;
    const { data } = action.payload;

    const parsed = JSON.parse(data);

    bus.publish(DataImportActions.DATA_PARSED, {
      data: { ...parsed, foo: "parsed" }
    });
  }
}

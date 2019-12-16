import { Subscriber } from "src/interface/subscription.interface";
import { DataImportActions } from "../data-import.actions";
import { Action } from "src/interface/action.interface";
import { Context } from "src/interface/context.interface";

export class CleanImpport implements Subscriber {
  react(action: Action, context: Context) {
    // Clean up whatever
    console.log('All cleaned...');
    context.bus.publish(DataImportActions.IMPORT_COMPLETED);
  }
}

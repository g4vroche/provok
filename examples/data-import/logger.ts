import { MessageBusHook } from "../../src/interface/messagebus.interface";
import { DataImportActions } from "./data-import.actions";

export const hooks = {
  [MessageBusHook.SUBSCRIBE]: [
    data => {
      const pattern = DataImportActions[data.pattern] || data.pattern;
      console.log(`${new Date().toISOString()} - SUB 👂 ${pattern}`);
    }
  ],
  [MessageBusHook.PUBLISH]: [
    data =>
      console.log(
        `${new Date().toISOString()} - PUB 🗣️  ${DataImportActions[data.type]}`
      )
  ]
};

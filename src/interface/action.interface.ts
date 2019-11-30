export type ActionType = any;

export interface ActionPayload {
  [key: string]: any;
}

export interface ActionMeta {
  [key: string]: any;
}

export interface Action {
  type: string;
  payload?: ActionPayload,
  meta?: ActionMeta
}

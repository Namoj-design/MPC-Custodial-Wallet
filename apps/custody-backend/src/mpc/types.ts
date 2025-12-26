export type MPCMessage =
  | JoinMessage
  | ReadyMessage
  | RoundMessage
  | CompleteMessage;

export type JoinMessage = {
  type: "join";
  sessionId?: string;
};

export type ReadyMessage = {
  type: "ready";
  sessionId: string;
};

export type RoundMessage = {
  type: "round";
  sessionId: string;
  round: number;
  payload: any;
};

export type CompleteMessage = {
  type: "complete";
  sessionId: string;
};
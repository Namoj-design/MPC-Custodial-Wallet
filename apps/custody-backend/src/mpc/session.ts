import { WebSocket } from "ws";

export type MPCParty = {
  id: string;
  socket: WebSocket;
};

export type MPCSession = {
  sessionId: string;
  parties: Map<string, MPCParty>;
};

export const sessions = new Map<string, MPCSession>();

export function createSession(): MPCSession {
  const sessionId = crypto.randomUUID();

  const session: MPCSession = {
    sessionId,
    parties: new Map(),
  };

  sessions.set(sessionId, session);
  console.log(`[MPC] session created: ${sessionId}`);

  return session;
}
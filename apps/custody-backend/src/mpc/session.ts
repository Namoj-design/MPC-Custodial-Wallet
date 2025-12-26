import { WebSocket } from "ws";
import { MPCState, initialState } from "./state";
import { MPCOrchestrator } from "./orchestrator";

export type MPCParty = {
  id: string;
  socket: WebSocket;
};

export type MPCSession = {
    sessionId: string;
    parties: Map<string, MPCParty>;
    state: MPCState;
    orchestrator: MPCOrchestrator;
  };

export const sessions = new Map<string, MPCSession>();

export function createSession(): MPCSession {
  const sessionId = crypto.randomUUID();

  const state = initialState();
  const parties = new Map<string, MPCParty>();

  const session: MPCSession = {
    sessionId,
    parties,
    state,
    orchestrator: undefined as unknown as MPCOrchestrator,
  };

  session.orchestrator = new MPCOrchestrator(session);

  sessions.set(sessionId, session);
  console.log(`[MPC] session created: ${sessionId}`);

  return session;
}
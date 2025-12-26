import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import {
  sessions,
  createSession,
  MPCSession,
} from "./session";

type JoinMessage = {
  type: "join";
  sessionId?: string;
};

type MPCMessage = {
  type: "mpc";
  sessionId: string;
  payload: any;
};

export function startMPCWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on(
    "connection",
    (socket: WebSocket, _req: IncomingMessage) => {
      const clientId = crypto.randomUUID();
      let currentSession: MPCSession | null = null;

      console.log(`[MPC] client connected: ${clientId}`);

      socket.on("message", (raw: Buffer) => {
        const message = JSON.parse(raw.toString());

        // JOIN session
        if (message.type === "join") {
          const joinMsg = message as JoinMessage;

          const session =
            joinMsg.sessionId && sessions.get(joinMsg.sessionId)
              ? sessions.get(joinMsg.sessionId)!
              : createSession();

          session.parties.set(clientId, {
            id: clientId,
            socket,
          });

          currentSession = session;

          socket.send(
            JSON.stringify({
              type: "joined",
              sessionId: session.sessionId,
              clientId,
            })
          );

          return;
        }

        // MPC message relay
        if (message.type === "mpc" && currentSession) {
          const mpcMsg = message as MPCMessage;

          currentSession.parties.forEach((party) => {
            if (party.id !== clientId) {
              party.socket.send(
                JSON.stringify({
                  type: "mpc",
                  from: clientId,
                  payload: mpcMsg.payload,
                })
              );
            }
          });
        }
      });

      socket.on("close", () => {
        if (currentSession) {
          currentSession.parties.delete(clientId);
        }
        console.log(`[MPC] client disconnected: ${clientId}`);
      });
    }
  );

  console.log("[MPC] WebSocket server ready");
}
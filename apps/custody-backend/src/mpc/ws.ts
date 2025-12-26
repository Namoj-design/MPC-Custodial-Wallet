import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import {
  sessions,
  createSession,
  MPCSession,
} from "./session";
import { MPCSessionState } from "./state";

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

        if (message.type === "join") {
            const joinMsg = message as JoinMessage;
          
            let session;
          
            // STRICT join logic
            if (joinMsg.sessionId) {
              session = sessions.get(joinMsg.sessionId);
          
              if (!session) {
                socket.send(
                  JSON.stringify({
                    type: "error",
                    message: "Session not found",
                  })
                );
                return;
              }
            } else {
              session = createSession();
            }
          
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

        // READY message: move session to READY state
        if (message.type === "ready" && currentSession) {
          currentSession.orchestrator.onReady();
          socket.send(
            JSON.stringify({
              type: "ready_ack",
              sessionId: currentSession.sessionId,
            })
          );
          return;
        }

        // ROUND message: advance MPC round and relay to other parties
        if (message.type === "round" && currentSession) {
          const result = currentSession.orchestrator.onRound(
            message.round,
            message.payload
          );

          currentSession.parties.forEach((party) => {
            if (party.id !== clientId) {
              party.socket.send(
                JSON.stringify({
                  type: "round",
                  from: clientId,
                  round: message.round,
                  payload: message.payload,
                })
              );
            }
          });
          return;
        }

        // ROUND 1: receive nonce
        if (message.type === "nonce" && currentSession) {
          const result = currentSession.orchestrator.onNonce(
            clientId,
            new Uint8Array(message.Ri)
          );

          if (result.allNoncesReceived) {
            (async () => {
              const challenge =
                await currentSession.orchestrator.computeChallenge(
                  new TextEncoder().encode("hello-mpc"),
                  new Uint8Array(message.publicKey)
                );

              currentSession.parties.forEach((p) =>
                p.socket.send(
                  JSON.stringify({
                    type: "challenge",
                    c: challenge.toString(),
                  })
                )
              );
            })();
          }
          return;
        }

        // ROUND 3: receive partial signature
        if (message.type === "partialSig" && currentSession) {
          (async () => {
            const result =
              await currentSession.orchestrator.onPartialSig(
                new TextEncoder().encode("hello-mpc"),
                new Uint8Array(message.publicKey),
                message.sig
              );

            if (result.complete) {
              currentSession.parties.forEach((p) =>
                p.socket.send(
                  JSON.stringify({
                    type: "signature",
                    signature: result.signature,
                  })
                )
              );
            }
          })();
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
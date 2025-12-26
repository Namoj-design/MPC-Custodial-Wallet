import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";

type MPCClient = {
  id: string;
  socket: WebSocket;
};

const clients = new Map<string, MPCClient>();

export function startMPCWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on(
    "connection",
    (socket: WebSocket, _req: IncomingMessage) => {
      const clientId = crypto.randomUUID();

      clients.set(clientId, { id: clientId, socket });

      console.log(`[MPC] client connected: ${clientId}`);

      socket.on("message", (data: Buffer) => {
        console.log(
          `[MPC] message from ${clientId}:`,
          data.toString()
        );
      });

      socket.on("close", () => {
        clients.delete(clientId);
        console.log(`[MPC] client disconnected: ${clientId}`);
      });
    }
  );

  console.log("[MPC] WebSocket server ready");
}
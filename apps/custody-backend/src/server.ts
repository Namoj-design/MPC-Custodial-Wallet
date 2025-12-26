import Fastify from "fastify";
import dotenv from "dotenv";
import { startMPCWebSocketServer } from "./mpc/ws";

dotenv.config();

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok", service: "custody-backend" };
});

const PORT = Number(process.env.PORT) || 3001;

app.listen({ port: PORT }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }

  startMPCWebSocketServer(app.server);

  app.log.info(`Custody backend running on ${address}`);
});

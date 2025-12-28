import Fastify, { FastifyInstance } from "fastify";
import dotenv from "dotenv";

import { hederaRoutes } from "/Users/namojperiakumar/Desktop/MPC-Custodial-Wallet/apps/custody-backend/src/api/controllers/routes/hederaRoutes";

dotenv.config();

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  app.register(hederaRoutes, { prefix: "/api" });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
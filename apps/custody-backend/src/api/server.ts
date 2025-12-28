import Fastify, { FastifyInstance } from "fastify";
import dotenv from "dotenv";

import { hederaRoutes } from "./routes/hederaRoutes.ts";
import { accountRoutes } from "./routes/accountRoutes.ts";

dotenv.config();

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // Register API routes
  app.register(accountRoutes, { prefix: "/api" });
  app.register(hederaRoutes, { prefix: "/api" });

  // Health check
  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
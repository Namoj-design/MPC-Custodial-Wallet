import type { FastifyInstance } from "fastify";
import { submitMpcSignedTx } from "/Users/namojperiakumar/Desktop/MPC-Custodial-Wallet/apps/custody-backend/src/api/controllers/hederaController.ts";

export async function hederaRoutes(app: FastifyInstance) {
  app.post("/hedera/submit", submitMpcSignedTx);
}
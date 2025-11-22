import express, { Application } from "express";
import walletRoutes from "/Users/namojperiakumar/Desktop/MPC-Wallet/backend/api/routes/walletRoutes.ts";
import accountRoutes from "/Users/namojperiakumar/Desktop/MPC-Wallet/backend/api/routes/accountRoutes.ts";
import transactionRoutes from "/Users/namojperiakumar/Desktop/MPC-Wallet/backend/api/routes/transactionRoutes.ts";
import topicRoutes from "/Users/namojperiakumar/Desktop/MPC-Wallet/backend/api/routes/topicRoutes.ts";
import { notFoundHandler } from "/Users/namojperiakumar/Desktop/MPC-Wallet/backend/api/middleware/notFoundHandler.ts";
import { errorHandler } from "./middleware/errorHandler";

export function createServer(): Application {
  const app = express();

  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "mpc-wallet-api" });
  });

  // API routes
  app.use("/api/wallet", walletRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/topics", topicRoutes);

  // 404 + error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
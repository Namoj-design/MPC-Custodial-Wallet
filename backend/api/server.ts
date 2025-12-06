import express from "express";
import { Request, Application } from "express";

import walletRoutes from "./routes/walletRoutes";
import accountRoutes from "./routes/accountRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import topicRoutes from "./routes/topicRoutes";

import { notFoundHandler } from "./middleware/notFoundHandler";
import { errorHandler } from "./middleware/errorHandler";

export function createServer(): Application {
  const app = express();

  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "mpc-wallet-api",
    });
  });

  // API routes
  app.use("/api/wallet", walletRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/topics", topicRoutes);

  // Errors
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
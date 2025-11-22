// backend/api/routes/transactionRoutes.ts
import { Router } from "express";
import {
  transferHbarHandler,
  getRecentTransactionsHandler,
} from "../controllers/transactionController";
import { requireAuth } from "../../auth";

const router = Router();

// POST /api/transactions/transfer
router.post("/transfer", requireAuth("USER"), transferHbarHandler);

// GET /api/transactions/recent
router.get("/recent", requireAuth("USER"), getRecentTransactionsHandler);

export default router;
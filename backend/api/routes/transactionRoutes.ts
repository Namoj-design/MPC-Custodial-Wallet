import { Router } from "express";
import { transferHbarHandler } from "../controllers/transactionController";

const router = Router();

// POST /api/transactions/transfer
router.post("/transfer", transferHbarHandler);

export default router;
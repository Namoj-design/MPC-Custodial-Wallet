import { Router } from "express";
import {
  transferHbarHandler,
  getRecentTransactionsHandler,
} from "../controllers/transactionController";

const router = Router();
// Route for transferring HBAR
router.post("/transfer", transferHbarHandler);

// Route for getting recent transactions
router.get("/recent", getRecentTransactionsHandler);

export default router;
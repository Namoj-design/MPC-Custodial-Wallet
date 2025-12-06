import { Router } from "express";
import { createAccountHandler, getBalanceHandler } from "../controllers/accountController";

const router = Router();

// POST /api/accounts
router.post("/", createAccountHandler);

// GET /api/accounts/:accountId/balance
router.get("/:accountId/balance", getBalanceHandler);

export default router;
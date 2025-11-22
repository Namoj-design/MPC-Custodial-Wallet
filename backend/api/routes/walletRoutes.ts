import { Router } from "express";
import { createCustodialWallet } from "../controllers/walletController";

const router = Router();

// POST /api/wallet
router.post("/", createCustodialWallet);

export default router;
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/ApiResponse";

export async function createCustodialWallet(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    // Placeholder: later connect to wallet-orchestrator + TSS engine
    const { ownerId } = req.body;

    res.status(201).json({
      success: true,
      data: {
        ownerId,
        walletId: `wallet_${Date.now()}`,
        status: "PENDING_KEY_DISTRIBUTION",
      },
    });
  } catch (err) {
    next(err);
  }
}
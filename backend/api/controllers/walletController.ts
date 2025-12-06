import { Request, Response, NextFunction } from "express";

// Define ApiResponse interface locally
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Controller function to create a custodial wallet
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
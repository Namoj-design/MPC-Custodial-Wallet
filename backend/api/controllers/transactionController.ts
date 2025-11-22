// backend/api/controllers/transactionController.ts
import { Request, Response, NextFunction } from "express";
import { HederaClient } from "../../../services/hedera-client/HederaClient";
import { TransactionService } from "../../../services/hedera-client/TransactionService";
import { ApiResponse } from "../types/ApiResponse";

const hederaClient = new HederaClient({
  operatorId: process.env.HEDERA_OPERATOR_ID || "",
  operatorKey: process.env.HEDERA_OPERATOR_KEY || "",
});

const transactionService = new TransactionService(hederaClient);

export async function transferHbarHandler(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    const { fromAccountId, toAccountId, amount } = req.body;

    const result = await transactionService.submitTransaction(
      fromAccountId,
      toAccountId,
      amount
    );

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json({ success: result.success, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getRecentTransactionsHandler(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    // TODO: replace with real DB query
    const items = [
      {
        id: "0.0.abc-123",
        from: "0.0.123456",
        to: "0.0.654321",
        amount: "10.5",
        status: "SUCCESS",
        createdAt: new Date().toISOString(),
      },
    ];
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}
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
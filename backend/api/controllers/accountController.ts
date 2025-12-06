import { Request, Response, NextFunction } from "express";
import { HederaClient } from "../../../services/hedera-client/HederaClient.ts";
import { AccountService } from "../../../services/hedera-client/AccountService.ts";
import { ApiResponse } from "../types/ApiResponse.js";

const hederaClient = new HederaClient({
  operatorId: process.env.HEDERA_OPERATOR_ID || "",
  operatorKey: process.env.HEDERA_OPERATOR_KEY || "",
});

const accountService = new AccountService(hederaClient);

export async function createAccountHandler(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    const result = await accountService.createAccount();
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getBalanceHandler(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    const { accountId } = req.params;
    const balance = await accountService.getBalance(accountId);
    res.status(200).json({ success: true, data: { accountId, balance } });
  } catch (err) {
    next(err);
  }
}
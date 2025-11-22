import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "/Users/namojperiakumar/Desktop/MPC-Wallet/backend/api/types/ApiResponse.ts";

export function notFoundHandler(
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
) {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
}
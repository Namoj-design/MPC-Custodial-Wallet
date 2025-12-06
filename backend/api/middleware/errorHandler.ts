import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/ApiResponse";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
) {
  // eslint-disable-next-line no-console
  console.error("[ERROR]", err);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : String(err),
  });
}
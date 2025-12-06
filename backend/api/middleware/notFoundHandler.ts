import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/ApiResponse";
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
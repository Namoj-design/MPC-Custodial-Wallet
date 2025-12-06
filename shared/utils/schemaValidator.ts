import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/AppError";

export const validateSchema =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err: any) {
      next(new AppError(err.errors?.[0]?.message || "Validation error", 400));
    }
  };
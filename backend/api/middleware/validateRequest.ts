import { RequestHandler } from "express";

export function validateRequest(_schema: unknown): RequestHandler {
  // You can plug in Zod / Joi here later.
  return (_req, _res, next) => next();
}
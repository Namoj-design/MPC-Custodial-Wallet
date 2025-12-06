// backend/auth/loginController.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "./authService";

const authService = new AuthService();

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    next(err);
  }
}
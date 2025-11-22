// backend/auth/signupController.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "./authService";

const authService = new AuthService();

export async function signupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, role } = req.body;
    const user = await authService.signup(email, password, role);
    res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    next(err);
  }
}
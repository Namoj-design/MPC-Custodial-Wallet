// backend/auth/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt";
import { hasRequiredRole, Role } from "./roles";
import { AuthService } from "./authService";

const authService = new AuthService();

export function requireAuth(requiredRole: Role = "USER") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      if (!header) throw new Error("Missing auth token");

      const token = header.replace("Bearer ", "");
      const payload = verifyToken(token);

      const user = await authService.getUserById(payload.userId);
      if (!user) throw new Error("User not found");

      if (!hasRequiredRole(user.role, requiredRole)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      (req as any).user = user;
      next();
    } catch (err) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  };
}
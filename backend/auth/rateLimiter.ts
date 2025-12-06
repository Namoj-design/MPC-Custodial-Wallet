// backend/auth/rateLimiter.ts

import { Request, Response, NextFunction } from "express";

const rateMap = new Map<string, { count: number; last: number }>();

export function rateLimiter(max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const data = rateMap.get(ip) || { count: 0, last: now };

    if (now - data.last > windowMs) {
      data.count = 0;
      data.last = now;
    }

    data.count++;
    rateMap.set(ip, data);

    if (data.count > max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    }

    next();
  };
}
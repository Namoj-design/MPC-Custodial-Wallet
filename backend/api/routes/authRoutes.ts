// backend/api/routes/authRoutes.ts

import { Router } from "express";
import { loginHandler, signupHandler } from "../../auth";
import { rateLimiter } from "../../auth/rateLimiter";

const router = Router();

/**
 * AUTH ROUTES
 *
 * /auth/signup
 * /auth/login
 *
 * These routes DO NOT require JWT.
 * They return:
 *   - user object
 *   - JWT token
 */

// Apply rate limiting for security (3 requests / 10 seconds)
router.post("/signup", rateLimiter(3, 10_000), signupHandler);

// Login issues JWT (rate limited)
router.post("/login", rateLimiter(5, 10_000), loginHandler);

export default router;
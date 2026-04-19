import { Router } from "express";
import { forgotPassword, googleAuth, login, register, resetPassword } from "../controllers/auth.controller";
import { authLimiter, strictAuthLimiter } from "../middleware/rateLimiter";
import { auth } from "google-auth-library";

export const authRoutes: Router = Router();

authRoutes.post("/signup", [authLimiter], register);
authRoutes.post("/login", [authLimiter], login);
authRoutes.post("/forgot-password", [strictAuthLimiter], forgotPassword);
authRoutes.post("/reset-password", [strictAuthLimiter], resetPassword);
authRoutes.post("/google", [authLimiter], googleAuth);

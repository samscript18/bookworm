import { Router } from "express";
import { forgotPassword, login, register, resetPassword } from "../controllers/auth.controller";
import { authLimiter, strictAuthLimiter } from "../middleware/rateLimiter";

export const authRoutes: Router = Router();

authRoutes.post("/signup", [authLimiter], register);
authRoutes.post("/login", [authLimiter], login);
authRoutes.post("/forgot-password", [strictAuthLimiter], forgotPassword);
authRoutes.post("/reset-password", [strictAuthLimiter], resetPassword);


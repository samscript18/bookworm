import { Router } from "express";
import { checkEmailExistence, checkUsernameExistence, forgotPassword, googleAuth, login, register, resetPassword } from "../controllers/auth.controller";
import { authLimiter, strictAuthLimiter } from "../middleware/rateLimiter";

export const authRoutes: Router = Router();

authRoutes.post("/check-email", checkEmailExistence);
authRoutes.post("/check-username", checkUsernameExistence);
authRoutes.post("/signup", [authLimiter], register);
authRoutes.post("/login", [authLimiter], login);
authRoutes.post("/forgot-password", [strictAuthLimiter], forgotPassword);
authRoutes.post("/reset-password", [strictAuthLimiter], resetPassword);
authRoutes.post("/google", [authLimiter], googleAuth);

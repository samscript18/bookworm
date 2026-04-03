import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { changePassword, editProfile, forgotPassword, getProfile, login, register, resetPassword } from "../controllers/auth.controller";
import { authLimiter, strictAuthLimiter } from "../middleware/rateLimiter";

export const authRoutes: Router = Router();

authRoutes.post("/signup", [authLimiter], register);
authRoutes.post("/login", [authLimiter], login);
authRoutes.post("/forgot-password", [strictAuthLimiter], forgotPassword);
authRoutes.post("/reset-password", [strictAuthLimiter], resetPassword);
authRoutes.get("/me", [authMiddleware, authLimiter], getProfile);
authRoutes.patch("/me", [authMiddleware, authLimiter], editProfile);
authRoutes.patch("/me/change-password", [authMiddleware, strictAuthLimiter], changePassword);

import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { changePassword, editProfile, forgotPassword, getProfile, login, register, resetPassword } from "../controllers/auth.controller";

export const authRoutes: Router = Router();

authRoutes.post("/signup", register);
authRoutes.post("/login", login);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.get("/me", [authMiddleware], getProfile);
authRoutes.patch("/me", [authMiddleware], editProfile);
authRoutes.patch("/me/change-password", [authMiddleware], changePassword);

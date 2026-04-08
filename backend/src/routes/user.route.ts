import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { authLimiter, strictAuthLimiter } from "../middleware/rateLimiter";
import { changePassword, editProfile, reactToUser, getProfile } from "../controllers/user.controller";

export const userRoutes: Router = Router();

userRoutes.get("/me", [authMiddleware, authLimiter], getProfile);
userRoutes.patch("/me", [authMiddleware, authLimiter], editProfile);
userRoutes.patch("/me/change-password", [authMiddleware, strictAuthLimiter], changePassword);
userRoutes.post("/:userId/react", [authMiddleware, authLimiter], reactToUser);

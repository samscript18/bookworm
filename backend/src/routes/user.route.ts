import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { authLimiter, strictAuthLimiter } from "../middleware/rateLimiter";
import { changePassword, editProfile, reactToUser, getProfile, updatePreferences, updateFcmToken, removeFcmToken, getUserConnections } from "../controllers/user.controller";

export const userRoutes: Router = Router();

userRoutes.get("/me", [authMiddleware, authLimiter], getProfile);
userRoutes.patch("/me", [authMiddleware, authLimiter], editProfile);
userRoutes.patch("/me/change-password", [authMiddleware, strictAuthLimiter], changePassword);
userRoutes.patch("/me/preferences", [authMiddleware, authLimiter], updatePreferences);
userRoutes.get("/:userId/connections", [authMiddleware, authLimiter], getUserConnections);
userRoutes.post("/:userId/react", [authMiddleware, authLimiter], reactToUser);
userRoutes.post("/me/update-fcm-token", [authMiddleware, authLimiter], updateFcmToken);
userRoutes.delete("/me/remove-fcm-token", [authMiddleware, authLimiter], removeFcmToken);

import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller";
import authMiddleware from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";

export const notificationRoutes: Router = Router();

notificationRoutes.get("/", [authMiddleware, authLimiter], getNotifications);
notificationRoutes.patch("/:notificationId/mark-as-read", [authMiddleware, authLimiter], markAsRead);
notificationRoutes.patch("/mark-all-as-read", [authMiddleware, authLimiter], markAsRead);

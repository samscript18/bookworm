import { Router } from "express";
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from "../controllers/notification.controller";
import authMiddleware from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";

export const notificationRoutes: Router = Router();

notificationRoutes.get("/", [authMiddleware, authLimiter], getNotifications);
notificationRoutes.get("/unread-count", [authMiddleware, authLimiter], getUnreadCount);
notificationRoutes.patch("/mark-all-as-read", [authMiddleware, authLimiter], markAllAsRead);
notificationRoutes.patch("/:notificationId/mark-as-read", [authMiddleware, authLimiter], markAsRead);

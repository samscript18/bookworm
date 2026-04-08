import { Router } from "express";
import { uploadMultipleImages, uploadSingleImage } from "../controllers/upload.controller";
import { strictAuthLimiter } from "../middleware/rateLimiter";
import { upload } from "../config/cloudinary";
import authMiddleware from "../middleware/auth";

export const uploadRoutes: Router = Router();

uploadRoutes.post("/single", [authMiddleware, strictAuthLimiter, upload.single("image")], uploadSingleImage);
uploadRoutes.post("/bulk", [authMiddleware, strictAuthLimiter, upload.array("images", 5)], uploadMultipleImages);

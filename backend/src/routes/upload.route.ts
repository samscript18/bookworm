import { Router } from "express";
import { uploadMultipleImages, uploadSingleImage } from "../controllers/upload.controller";
import { authLimiter } from "../middleware/rateLimiter";
import { upload } from "../config/cloudinary";

export const uploadRoutes: Router = Router();

uploadRoutes.post("/single", [authLimiter, upload.single("image")], uploadSingleImage);
uploadRoutes.post("/bulk", [authLimiter, upload.array("images", 5)], uploadMultipleImages);

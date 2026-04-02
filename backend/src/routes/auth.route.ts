import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { editProfile, getProfile, login, register } from "../controllers/auth.controller";

export const authRoutes: Router = Router();

authRoutes.post("/signup", register);
authRoutes.post("/login", login);
authRoutes.get("/me", [authMiddleware], getProfile);
authRoutes.patch("/me", [authMiddleware], editProfile);

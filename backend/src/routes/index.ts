import { Router } from "express";
import { authRoutes } from "./auth.route";
import { bookRoutes } from "./book.route";
import { commentRoutes } from "./comment.route";
import { userRoutes } from "./user.route";
import { reviewRoutes } from "./review.route";
import { uploadRoutes } from "./upload.route";

export const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/users", userRoutes);
rootRouter.use("/books", bookRoutes);
rootRouter.use("/comments", commentRoutes);
rootRouter.use("/reviews", reviewRoutes);
rootRouter.use("/upload", uploadRoutes);

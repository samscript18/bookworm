import { Router } from "express";
import { authRoutes } from "./auth.route";
import { bookRoutes } from "./book.route";
import { commentRoutes } from "./comment.route";

export const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/books", bookRoutes);
rootRouter.use("/comments", commentRoutes);
import { Router } from "express";
import { deleteComment, editComment, reactToComment } from "../controllers/comment.controller";
import authMiddleware from "../middleware/auth";

export const commentRoutes: Router = Router();

commentRoutes.patch("/:commentId", [authMiddleware], editComment);
commentRoutes.delete("/:commentId", [authMiddleware], deleteComment);
commentRoutes.post("/:commentId/react", [authMiddleware], reactToComment);

import { Router } from "express";
import { addComment, deleteComment, editComment, getCommentsByBookId, reactToComment } from "../controllers/comment.controller";
import authMiddleware from "../middleware/auth";

export const commentRoutes: Router = Router();

commentRoutes.post("/", [authMiddleware], addComment);
commentRoutes.post("/:commentId/react", [authMiddleware], reactToComment);
commentRoutes.get("/book/:bookId", [authMiddleware], getCommentsByBookId);
commentRoutes.patch("/:commentId", [authMiddleware], editComment);
commentRoutes.delete("/:commentId", [authMiddleware], deleteComment);

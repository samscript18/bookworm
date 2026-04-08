import { Router } from "express";
import { addCommentToReview, deleteReview, editReview, getCommentsByReview, getHomeFeed, getReviewsByBook, getReviewsByUser, postReview, reactToReview } from "../controllers/review.controller";
import authMiddleware from "../middleware/auth";

export const reviewRoutes: Router = Router();

reviewRoutes.get("/home-feed", [authMiddleware], getHomeFeed);
reviewRoutes.get("/user/me", [authMiddleware], getReviewsByUser);
reviewRoutes.get("/book/:bookId", [authMiddleware], getReviewsByBook);
reviewRoutes.post("/:bookId", [authMiddleware], postReview);
reviewRoutes.patch("/:reviewId", [authMiddleware], editReview);
reviewRoutes.delete("/:reviewId", [authMiddleware], deleteReview);
reviewRoutes.post("/:reviewId/comment", [authMiddleware], addCommentToReview);
reviewRoutes.get("/:reviewId/comments", [authMiddleware], getCommentsByReview);
reviewRoutes.post("/:reviewId/react", [authMiddleware], reactToReview);

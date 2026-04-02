import { Router } from "express";
import { createBook, getAllBooks, getBookById, rateBook } from "../controllers/book.controller";
import authMiddleware from "../middleware/auth";

export const bookRoutes: Router = Router();

bookRoutes.post("/", [authMiddleware], createBook);
bookRoutes.get("/", [authMiddleware], getAllBooks);
bookRoutes.get("/:bookId", [authMiddleware], getBookById);
bookRoutes.post("/:bookId/rate", [authMiddleware], rateBook);
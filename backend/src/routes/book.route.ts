import { Router } from "express";
import { createBook, getAllBooks, getBookById, getSavedBooks, getTrendingBooks, reactToBook } from "../controllers/book.controller";
import authMiddleware from "../middleware/auth";

export const bookRoutes: Router = Router();

bookRoutes.post("/", [authMiddleware], createBook);
bookRoutes.get("/", [authMiddleware], getAllBooks);
bookRoutes.get("/trending", [authMiddleware], getTrendingBooks);
bookRoutes.get("/saved", [authMiddleware], getSavedBooks);
bookRoutes.get("/:bookId", [authMiddleware], getBookById);
bookRoutes.post("/:bookId/react", [authMiddleware], reactToBook);
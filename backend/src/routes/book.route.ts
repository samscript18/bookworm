import { Router } from "express";
import { createBook, getAllBooks, getBookById, getSavedBooks, getTrendingBooks, reactToBook, getTrendingGenres, getAllGenres, syncExternalBooks, saveBookToLibrary } from "../controllers/book.controller";
import authMiddleware from "../middleware/auth";

export const bookRoutes: Router = Router();

bookRoutes.post("/", [authMiddleware], createBook);
bookRoutes.get("/", [authMiddleware], getAllBooks);
bookRoutes.get("/trending", [authMiddleware], getTrendingBooks);
bookRoutes.get("/saved", [authMiddleware], getSavedBooks);
bookRoutes.get("/genres/trending", [authMiddleware], getTrendingGenres);
bookRoutes.get("/genres/all", [authMiddleware], getAllGenres);
bookRoutes.post("/sync/external", syncExternalBooks);
bookRoutes.get("/:bookId", [authMiddleware], getBookById);
bookRoutes.post("/:bookId/save", [authMiddleware], saveBookToLibrary);
bookRoutes.post("/:bookId/react", [authMiddleware], reactToBook);

import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: "Too many requests. Try again later.",
	standardHeaders: true,
	legacyHeaders: false,
});

export const strictAuthLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Too many attempts. Please wait 15 minutes.",
});

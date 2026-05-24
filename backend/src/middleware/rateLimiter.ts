import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 120,
	message: "Too many requests. Try again later.",
	standardHeaders: true,
	legacyHeaders: false,
});

export const strictAuthLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 15,
	message: "Too many attempts. Please wait 10 minutes.",
});

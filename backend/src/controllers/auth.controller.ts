import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, googleAuthSchema } from "../schemas/auth.schema";
import { UnprocessableEntity } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";

export const register = asyncHandler(async (req: Request, res: Response) => {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const data: { firstName: string; lastName: string; userName: string; email: string; password: string; profileImage?: string; bio?: string } = {
		email: parsed.data.email,
		password: parsed.data.password,
		firstName: parsed.data.firstName,
		lastName: parsed.data.lastName,
		userName: parsed.data.userName,
	};

	if (parsed.data.profileImage) {
		data.profileImage = parsed.data.profileImage;
	}

	if (parsed.data.bio) {
		data.bio = parsed.data.bio;
	}

	const result = await AuthService.register(data);
	res.status(201).json({ success: true, message: "User registered successfully", data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const result = await AuthService.login(parsed.data.email, parsed.data.password);
	res.json({ success: true, message: "User logged in successfully", data: result });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
	const parsed = googleAuthSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const result = await AuthService.googleAuth(parsed.data.idToken);
	return res.json({ success: true, message: "Google authentication successful", data: result });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
	const parsed = forgotPasswordSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const result = await AuthService.forgotPassword(parsed.data.email);
	res.json({ success: true, message: result.message });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
	const parsed = resetPasswordSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const result = await AuthService.resetPassword(parsed.data.token, parsed.data.password);
	res.json({ success: true, message: result.message });
});

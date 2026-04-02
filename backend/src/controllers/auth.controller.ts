import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema, editProfileSchema } from "../schemas/auth.schema";
import { UnprocessableEntity } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";

export const register = asyncHandler(async (req: Request, res: Response) => {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const result = await AuthService.register(parsed.data.firstName, parsed.data.lastName, parsed.data.userName, parsed.data.email, parsed.data.password, parsed.data.profileImage);
	res.status(201).json({ success: true, message: "User registered successfully", data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const result = await AuthService.login(parsed.data.email, parsed.data.password);
	res.json({ success: true, message: "User logged in successfully", data: result });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnprocessableEntity("User not authenticated", ErrorCode.UNPROCESSABLE_ENTITY, {});
	const userId = req.user._id.toString();

	const result = await AuthService.getUserById(userId);
	res.json({ success: true, message: "User data retrieved successfully", data: result });
});

export const editProfile = asyncHandler(async (req: Request, res: Response) => {
	const parsed = editProfileSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	if (!req.user) throw new UnprocessableEntity("User not authenticated", ErrorCode.UNPROCESSABLE_ENTITY, {});
	const userId = req.user._id.toString();

	const filteredData = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
	const result = await AuthService.editUser(userId, filteredData);
	res.json({ success: true, message: "User profile updated successfully", data: result });
});

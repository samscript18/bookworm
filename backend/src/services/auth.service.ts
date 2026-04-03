import { IUser, User } from "../models/user.model";
import { UnAuthorizedException, BadRequestsException, NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { comparePassword, generateResetToken, hashPassword, hashToken, jwtHelper, sanitizeUser } from "../utils/helpers/helper";
import { transporter } from "../config/email";
import secrets from "../constants/secrets.constant";

export class AuthService {
	static async register(firstName: string, lastName: string, userName: string, email: string, password: string, profileImage?: string) {
		const existing = await User.findOne({ email });
		if (existing) throw new BadRequestsException("Account already exists", ErrorCode.ALREADY_EXISTS);

		const hashedPassword = await hashPassword(password);
		const data: {
			firstName: string;
			lastName: string;
			userName: string;
			email: string;
			password: string;
			profileImage?: string;
		} = { firstName, lastName, userName, email, password: hashedPassword };
		if (profileImage) {
			data.profileImage = profileImage;
		}
		const user = await User.create(data);

		const token = jwtHelper.generateToken(user._id.toString());
		const returnedUser = sanitizeUser(user);
		return { user: returnedUser, token };
	}

	static async login(email: string, password: string) {
		const user = await User.findOne({ email });
		if (!user) throw new UnAuthorizedException("Invalid Credentials", ErrorCode.NOT_FOUND);

		if (user.loginBlockedUntil && user.loginBlockedUntil > new Date()) {
			throw new BadRequestsException("Account temporarily locked. Try later.", ErrorCode.TEMPORARILY_LOCKED);
		}

		const valid = await comparePassword(password, user.password);
		if (!valid) {
			user.loginAttempts = (user.loginAttempts || 0) + 1;

			if (user.loginAttempts >= 5) {
				user.loginBlockedUntil = new Date(Date.now() + 10 * 60 * 1000);
				user.loginAttempts = 0;
			}

			await user.save();
			throw new UnAuthorizedException("Invalid Credentials", ErrorCode.INCORRECT_PASSWORD);
		}

		user.loginAttempts = 0;
		user.loginBlockedUntil = null;
		await user.save();

		const token = jwtHelper.generateToken(user._id.toString());
		const returnedUser = sanitizeUser(user);
		return { user: returnedUser, token };
	}

	static async getUserById(userId: string) {
		const user = await User.findById(userId);
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);
		return sanitizeUser(user);
	}

	static async editUser(userId: string, data: Partial<IUser>) {
		const user = await User.findByIdAndUpdate(userId, data, { returnDocument: "after" });
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);
		return sanitizeUser(user);
	}

	static async forgotPassword(email: string) {
		const user = await User.findOne({ email });
		if (!user) throw new NotFoundException("Invalid Credentials", ErrorCode.NOT_FOUND);

		if (user.resetBlockedUntil && user.resetBlockedUntil > new Date()) {
			throw new BadRequestsException("Too many reset attempts. Please try again later.", ErrorCode.UNAUTHORIZED);
		}

		user.resetPasswordToken = null;
		user.resetPasswordExpires = null;

		const { token, hashedToken } = generateResetToken();

		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
		user.resetAttempts = (user.resetAttempts || 0) + 1;

		if (user.resetAttempts >= 5) {
			user.resetBlockedUntil = new Date(Date.now() + 10 * 60 * 1000);
			user.resetAttempts = 0;
		}
		await user.save();

		const mailOptions = {
			from: "<no-reply@bookworm.com>",
			to: user.email,
			subject: "Password Reset Request",
			template: "password-reset",
			context: {
				firstName: user.firstName,
				token,
			},
		};

		try {
			await (await transporter()).sendMail(mailOptions);
			console.log("[AuthService] Password reset email sent to:", user.email);
		} catch (error) {
			console.error("[AuthService] Error sending password reset email:", error);
		}

		return { message: "Password reset token has been sent to email" };
	}

	static async resetPassword(token: string, password: string) {
		const hashedToken = hashToken(token);

		const user = await User.findOne({
			resetPasswordToken: hashedToken,
		});

		if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() <= Date.now()) {
			throw new BadRequestsException("Invalid or expired token", ErrorCode.EXPIRED_AUTH_TOKEN);
		}

		if (user.resetBlockedUntil && user.resetBlockedUntil > new Date()) {
			throw new BadRequestsException("Too many reset attempts. Please try again later.", ErrorCode.UNAUTHORIZED);
		}

		const hashedPassword = await hashPassword(password);
		user.password = hashedPassword;
		user.resetPasswordToken = null;
		user.resetPasswordExpires = null;
		user.resetAttempts = 0;
		user.resetBlockedUntil = null;
		await user.save();

		return { message: "Password reset successful" };
	}

	static async changePassword(currentPassword: string, newPassword: string, userId: string) {
		const user = await User.findById(userId);
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		const isMatch = await comparePassword(currentPassword, user.password);
		if (!isMatch) throw new BadRequestsException("Invalid Credentials", ErrorCode.INCORRECT_PASSWORD);

		if (currentPassword === newPassword) {
			throw new BadRequestsException("New password cannot be the same as the old one.", ErrorCode.SAME_PASSWORD);
		}

		user.password = await hashPassword(newPassword);
		await user.save();

		return { message: "Password changed successfully" };
	}
}

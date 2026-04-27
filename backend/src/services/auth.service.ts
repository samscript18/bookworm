import { User, UserDocument } from "../models/user.model";
import { UnAuthorizedException, BadRequestsException, NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { comparePassword, generateResetToken, generateUniqueUsername, hashPassword, hashToken, jwtHelper, sanitizeUser } from "../utils/helpers/helper";
import { transporter } from "../config/email";
import secrets from "../constants/secrets.constant";
import { OAuth2Client } from "google-auth-library";

export class AuthService {
	static client = new OAuth2Client(secrets.googleClientId);

	static async createUniqueUsername(userData: { name: string; email: string }) {
		let username = generateUniqueUsername(userData.name);
		let isUnique = false;
		let attempts = 0;

		while (!isUnique && attempts < 5) {
			const existingUser = await User.findOne({ userName: username });

			if (!existingUser) {
				isUnique = true;
			} else {
				username = generateUniqueUsername(userData.name);
				attempts++;
			}
		}

		return username;
	}

	static async checkExistingEmail(email: string) {
		const isExisting = await User.exists({ email });
		return { exists: !!isExisting };
	}

	static async checkExistingUsername(username: string) {
		const isExisting = await User.exists({ userName: username });
		return { exists: !!isExisting };
	}

	static async register(data: { firstName: string; lastName: string; userName: string; email: string; password: string; profileImage?: string; bio?: string }) {
		const existing = await User.findOne({ email: data.email });
		if (existing) throw new BadRequestsException("Account already exists", ErrorCode.ALREADY_EXISTS);

		const hashedPassword = await hashPassword(data.password);
		const userData: {
			firstName: string;
			lastName: string;
			userName: string;
			email: string;
			password: string;
			profileImage?: string;
			bio?: string;
		} = { firstName: data.firstName, lastName: data.lastName, userName: data.userName, email: data.email, password: hashedPassword };
		if (data.profileImage) {
			userData.profileImage = data.profileImage;
		}
		if (data.bio) {
			userData.bio = data.bio;
		}

		const user = await User.create(userData);

		const token = jwtHelper.generateToken(user?._id.toString());
		const returnedUser = sanitizeUser(user);
		return { user: returnedUser, token };
	}

	static async login(email: string, password: string) {
		const user = await User.findOne({ email });
		if (!user) throw new UnAuthorizedException("Invalid Credentials", ErrorCode.NOT_FOUND);

		if (user.loginBlockedUntil && user.loginBlockedUntil > new Date()) {
			throw new BadRequestsException("Account temporarily locked. Try later.", ErrorCode.TEMPORARILY_LOCKED);
		}

		if (!user.password && user.googleId) {
			throw new BadRequestsException("Please log in with Google", ErrorCode.AUTH_REQUIRED);
		}

		if (!user.password) {
			throw new BadRequestsException("Invalid Credentials", ErrorCode.INCORRECT_PASSWORD);
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

	static async googleAuth(idToken: string) {
		try {
			const ticket = await this.client.verifyIdToken({
				idToken,
				audience: secrets.googleClientId,
			});

			const payload = ticket.getPayload();
			if (!payload) throw new BadRequestsException("Invalid token payload", ErrorCode.INVALID_GOOGLE_TOKEN);

			const { sub: googleId, email, name, given_name, family_name, picture } = payload;

			if (!email) {
				throw new BadRequestsException("Google account has no email", ErrorCode.INVALID_GOOGLE_TOKEN);
			}

			let user = await User.findOne({ email });

			if (user) {
				if (user.password && user.googleId === null) {
					throw new BadRequestsException("Please log in with email and password", ErrorCode.AUTH_REQUIRED);
				}
			} else {
				const localPart = email.split("@")[0] ?? email;
				const fullName = `${given_name ?? ""} ${family_name ?? ""}`.trim();
				const baseName = name ?? (fullName || localPart);
				const userName = await this.createUniqueUsername({ name: baseName, email });

				const data = {
					email,
					firstName: given_name ?? "",
					lastName: family_name ?? "",
					userName,
					googleId,
					...(picture ? { profileImage: picture } : {}),
				};

				user = await User.create(data);
			}

			const token = jwtHelper.generateToken(user._id.toString());

			return { token, user: sanitizeUser(user) };
		} catch (error) {
			console.error("[AuthService] Google auth failed:", error);
			throw new BadRequestsException("Google authentication failed", ErrorCode.INVALID_GOOGLE_TOKEN);
		}
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

		if (user.password === hashedPassword) {
			throw new BadRequestsException("New password cannot be the same as the old one.", ErrorCode.SAME_PASSWORD);
		}

		user.password = hashedPassword;
		user.resetPasswordToken = null;
		user.resetPasswordExpires = null;
		user.resetAttempts = 0;
		user.resetBlockedUntil = null;
		await user.save();

		return { message: "Password reset successful" };
	}
}

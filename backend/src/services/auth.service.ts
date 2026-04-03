import { IUser, User } from "../models/user.model";
import { UnAuthorizedException, BadRequestsException, NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { comparePassword, generateResetToken, hashPassword, hashToken, jwtHelper, sanitizeUser } from "../utils/helpers/helper";

export class AuthService {
	static async register(firstName: string, lastName: string, userName: string, email: string, password: string, profileImage?: string) {
		const existing = await User.findOne({ email });
		if (existing) throw new BadRequestsException("User already exists", ErrorCode.ALREADY_EXISTS);

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
		if (!user) throw new UnAuthorizedException("User not found", ErrorCode.NOT_FOUND);

		const valid = await comparePassword(password, user.password);
		if (!valid) throw new UnAuthorizedException("Incorrect password", ErrorCode.INCORRECT_PASSWORD);

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
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		const { token, hashedToken } = generateResetToken();

		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
		await user.save();

		// TODO: send token to user email

		return { message: "Password reset token generated and sent to email" };
	}

	static async resetPassword(token: string, password: string) {
		const hashedToken = hashToken(token);

		const user = await User.findOne({
			resetPasswordToken: hashedToken,
		});

		if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() <= Date.now()) {
			throw new BadRequestsException("Invalid or expired token", ErrorCode.EXPIRED_AUTH_TOKEN);
		}

		user.password = await hashPassword(password);
		delete user.resetPasswordToken;
		delete user.resetPasswordExpires;

		await user.save();

		return { message: "Password reset successful" };
	}

	static async changePassword(currentPassword: string, newPassword: string, userId: string) {
		const user = await User.findById(userId);
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		const isMatch = await comparePassword(currentPassword, user.password);
		if (!isMatch) throw new BadRequestsException("Wrong password", ErrorCode.INCORRECT_PASSWORD);

		user.password = await hashPassword(newPassword);
		await user.save();

		return { message: "Password updated" };
	}
}

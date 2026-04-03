import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import secrets from "../../constants/secrets.constant";
import { UserDocument } from "../../models/user.model";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export const hashToken = (token: string): string => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateResetToken = () => {
	const token = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
	const hashedToken = hashToken(token);

	return { token, hashedToken };
};

class JWT {
	private get secret(): string {
		return secrets.jwtSecret;
	}

	public generateToken(userId: string): string {
		return jwt.sign({ sub: userId }, this.secret, {
			expiresIn: "7d",
			algorithm: "HS256",
		});
	}

	public verifyToken<T = JwtPayload>(token: string): T {
		try {
			return jwt.verify(token, this.secret) as T;
		} catch (err) {
			throw new Error("Invalid or expired token");
		}
	}
}
export const jwtHelper = new JWT();

export const sanitizeUser = (user: UserDocument) => {
	const userObj = user.toObject();
	const { password, __v, ...sanitized } = userObj;
	return sanitized;
};

export function resolvePagination(count: number, pageQuery?: number, limitQuery?: number) {
	const page = Math.max(1, pageQuery || 1);
	const limit = Math.min(Math.max(1, limitQuery || 10), 100);

	const skip = (page - 1) * limit;
	const totalPages = Math.ceil(count / limit);

	return {
		skip,
		page,
		limit,
		totalPages,
		totalItems: count,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
	};
}

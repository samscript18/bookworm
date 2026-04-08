import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import secrets from "../../constants/secrets.constant";
import { UserDocument } from "../../models/user.model";
import crypto from "crypto";
import { PaginationQuery } from "../../types/pagination.type"; 

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

export const generateUniqueUsername = (baseName: string): string => {
	const cleanName = baseName
		.toLowerCase()
		.replace(/\s+/g, "")
		.replace(/[^a-z0-9]/g, "");

	const suffix = crypto.randomBytes(2).toString("hex");

	return `${cleanName}${suffix}`;
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

export function getPaginationData(query: PaginationQuery, count: number) {
	const skip = typeof query?.page === "number" ? query.page : 1;
	let limit = query?.limit ?? 30;
	const offset = (skip - 1) * limit;
	const totalPages = Math.ceil(count / limit);
	if (query?.limit === 0 && count === 0) limit++;

	return {
		limit,
		offset,
		totalPages,
	};
}

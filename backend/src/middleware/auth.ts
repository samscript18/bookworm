import { NextFunction, Request, Response } from "express";
import { ErrorCode } from "../exceptions/root";
import { UnAuthorizedException } from "../exceptions/exceptions";
import { jwtHelper } from "../utils/helpers/helper";
import { IUser, User } from "../models/user.model";

declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next(new UnAuthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		return next(new UnAuthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
	}

	try {
		const payload = jwtHelper.verifyToken(token);
		const userId = payload.sub || (payload as any).userId;

		if (!userId) {
			return next(new UnAuthorizedException("Invalid token payload", ErrorCode.UNAUTHORIZED));
		}

		const user = await User.findById(userId).select("-password -__v");

		if (!user) {
			return next(new UnAuthorizedException("User no longer exists", ErrorCode.NOT_FOUND));
		}

		req.user = user;
		next();
	} catch (error) {
		return next(new UnAuthorizedException("Session expired or invalid", ErrorCode.UNAUTHORIZED, error));
	}
};

export default authMiddleware;

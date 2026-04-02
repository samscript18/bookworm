import { Request, Response, NextFunction } from "express";
import { HttpException, ErrorCode } from "../exceptions/root";
import { ZodError } from "zod";
import { InternalException, UnprocessableEntity } from "../exceptions/exceptions";

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
	let exception: HttpException;

	if (error instanceof HttpException) {
		exception = error;
	} else if (error instanceof ZodError) {
		exception = new UnprocessableEntity("Unprocessable entity", ErrorCode.UNPROCESSABLE_ENTITY, error);
	} else {
		exception = new InternalException("Internal Server Error", ErrorCode.INTERNAL_SERVER_ERROR, error);
	}

	res.status(exception.statusCode).json({
		success: false,
		message: exception.message,
		errorCode: exception.errorCode,
		errors: exception.errors ?? null,
	});
};

export class HttpException extends Error {
	statusCode: number;
	errorCode: ErrorCode;
	errors?: unknown;

	constructor(message: string, statusCode: number, errorCode: ErrorCode, errors?: unknown) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
		this.errors = errors;

		Error.captureStackTrace(this, this.constructor);
	}
}

export enum ErrorCode {
	ALREADY_EXISTS = 1001,
	NOT_FOUND = 1002,
	INCORRECT_PASSWORD = 2001,
	INTERNAL_SERVER_ERROR = 3001,
	EXPIRED_AUTH_TOKEN = 4000,
	UNPROCESSABLE_ENTITY = 4001,
	UNAUTHORIZED = 4002,
	TEMPORARILY_LOCKED = 4003,
	AUTH_REQUIRED = 4004,
	SAME_PASSWORD = 4005,
}

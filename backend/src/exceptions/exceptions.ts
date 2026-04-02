import { ErrorCode, HttpException } from "./root";

export class NotFoundException extends HttpException {
	constructor(message: string, errorCode: ErrorCode) {
		super(message, 404, errorCode, null);
	}
}

export class BadRequestsException extends HttpException {
	constructor(message: string, errorCode: ErrorCode) {
		super(message, 400, errorCode, null);
	}
}

export class InternalException extends HttpException {
	constructor(message: string, errorCode: ErrorCode, errors: any) {
		super(message, 500, errorCode, errors);
	}
}

export class UnAuthorizedException extends HttpException {
	constructor(message: string, errorCode: ErrorCode, errors?: any) {
		super(message, 401, errorCode, errors);
	}
}

export class UnprocessableEntity extends HttpException {
	constructor(message: string, errorCode: ErrorCode, errors: any) {
		super(message, 422, errorCode, errors);
	}
}
export type LoginDto = {
	email: string;
	password: string;
};

export type SignUpDto = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	userName: string;
	bio?: string;
	profileImage?: string;
};

export type ForgotPasswordDto = {
	email: string;
};

export type ResetPasswordDto = {
	token: string;
	password: string;
};

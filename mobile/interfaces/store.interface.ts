import { User } from "@/types/user/user";
import { RegistrationDto } from "./auth.interface";

export interface AuthState {
	registrationData: RegistrationDto;
	setRegistrationData: (data: Partial<RegistrationDto>) => void;
	accessToken: string;
	setAccessToken: (token: string) => void;
	registrationStep: number;
	setRegistrationStep: (step: number) => void;
	hasCompletedOnboarding: boolean;
	setHasCompletedOnboarding: (value: boolean) => void;
	isAuthenticated: boolean;
	setIsAuthenticated: (value: boolean) => void;
	forgotPasswordToken: string;
	setForgotPasswordToken: (token: string) => void;
	passwordResetStep: number;
	setPasswordResetStep: (step: number) => void;
	logout: () => Promise<void>;
	user: User | null;
	setUser: (user: User | null) => void;
}

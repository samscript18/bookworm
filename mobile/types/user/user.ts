import z from "zod";
import { BaseModelType } from "..";
import { editProfileSchema } from "@/schemas/user.schema";

export type User = {
	email: string;
	firstName: string;
	lastName: string;
	userName: string;
	profileImage?: string;
	bio?: string;
} & BaseModelType;

export type EditProfileType = z.infer<typeof editProfileSchema>;

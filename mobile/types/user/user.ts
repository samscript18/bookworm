import z from "zod";
import { BaseModelType } from "..";
import { changePasswordSchema, editProfileSchema } from "@/schemas/user.schema";
import { Book } from "../book/book";
import { Review } from "../review/review";

export type User = {
	email: string;
	firstName: string;
	lastName: string;
	userName: string;
	profileImage?: string;
	bio?: string;
	googleId?: string;
	favoriteGenres: string[];
	followers: Array<{ _id: string; userName: string; profileImage?: string }>;
	followersCount: number;
	following: string[];
	isFollowing: boolean;
	followingCount: number;
	reviewsCount: number;
	savedBooks: string[];
} & BaseModelType;

export type EditProfileType = z.infer<typeof editProfileSchema>;

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;

export type ProfileItem = Book | Review;

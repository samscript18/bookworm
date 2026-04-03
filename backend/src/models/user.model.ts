import mongoose, { Schema, Document, HydratedDocument } from "mongoose";

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	userName: string;
	email: string;
	password: string;
	googleId: string | null;
	profileImage: string;
	resetPasswordToken: string | null;
	resetPasswordExpires: Date | null;
	resetAttempts: number;
	resetBlockedUntil: Date | null;
	loginAttempts: number;
	loginBlockedUntil: Date | null;
	createdAt: Date;
}

const UserSchema: Schema = new Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		userName: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		profileImage: { type: String, required: false, default: "https://res.cloudinary.com/dynopc0cn/image/upload/v1775118766/default-image_cucpzx.avif" },
		googleId: { type: String, required: false },
		resetPasswordToken: { type: String, required: false },
		resetPasswordExpires: { type: Date, required: false },
		resetAttempts: { type: Number, default: 0 },
		resetBlockedUntil: { type: Date, default: null },
		loginAttempts: { type: Number, default: 0 },
		loginBlockedUntil: { type: Date, default: null },
	},
	{ timestamps: true },
);

export const User = mongoose.model<IUser>("User", UserSchema);
export type UserDocument = HydratedDocument<IUser>;

import mongoose, { Schema, Document, HydratedDocument, Types } from "mongoose";

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	userName: string;
	email: string;
	password: string | null;
	bio?: string;
	favoriteGenres: string[];
	reviewsCount: number;
	followersCount: number;
	followingCount: number;
	followers: Types.ObjectId[];
	following: Types.ObjectId[];
	savedBooks: Types.ObjectId[];
	googleId: string | null;
	profileImage: string;
	resetPasswordToken: string | null;
	resetPasswordExpires: Date | null;
	resetAttempts: number;
	resetBlockedUntil: Date | null;
	loginAttempts: number;
	loginBlockedUntil: Date | null;
	fcmTokens: string[];
	preferences: {
		pushNotifications: boolean;
		darkMode: boolean;
	};
	createdAt: Date;
	updatedAt: Date;
}

export const DEFAULT_IMAGE = "https://res.cloudinary.com/dynopc0cn/image/upload/v1775118766/default-image_cucpzx.avif";

const UserSchema: Schema = new Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		userName: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: false, default: null },
		profileImage: { type: String, default: DEFAULT_IMAGE },
		bio: { type: String, default: "", maxlength: 300 },
		favoriteGenres: [{ type: String }],
		reviewsCount: { type: Number, default: 0 },
		followersCount: { type: Number, default: 0 },
		followingCount: { type: Number, default: 0 },
		followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
		following: [{ type: Schema.Types.ObjectId, ref: "User" }],
		savedBooks: [{ type: Schema.Types.ObjectId, ref: "Book" }],
		googleId: { type: String, required: false, unique: true, default: null },
		resetPasswordToken: { type: String, required: false },
		resetPasswordExpires: { type: Date, required: false },
		resetAttempts: { type: Number, default: 0 },
		resetBlockedUntil: { type: Date, default: null },
		loginAttempts: { type: Number, default: 0 },
		loginBlockedUntil: { type: Date, default: null },
		fcmTokens: [{ type: String }],
		preferences: {
			pushNotifications: { type: Boolean, default: true },
			darkMode: { type: Boolean, default: false },
		},
	},
	{ timestamps: true },
);

UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });
UserSchema.index({ savedBooks: 1 });
UserSchema.index({ resetPasswordToken: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
export type UserDocument = HydratedDocument<IUser>;

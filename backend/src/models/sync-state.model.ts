import mongoose, { Schema, Document } from "mongoose";

export interface ISyncState extends Document {
	key: string;
	lastSyncedAt: Date;
	metadata?: Record<string, unknown>;
}

const SyncStateSchema: Schema = new Schema(
	{
		key: { type: String, required: true, unique: true },
		lastSyncedAt: { type: Date, required: true },
		metadata: { type: Schema.Types.Mixed },
	},
	{ timestamps: true },
);

export const SyncState = mongoose.model<ISyncState>("SyncState", SyncStateSchema);

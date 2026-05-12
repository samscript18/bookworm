import mongoose from "mongoose";
import { Notification } from "../models/notification.model";

export const connectDB = async () => {
	const uri = process.env.MONGO_URI;

	if (!uri) {
		console.error("Error: MONGO_URI is not defined in environment variables.");
		process.exit(1);
	}

	try {
		const conn = await mongoose.connect(uri);
		console.log(`Database connected`);

		mongoose.connection.on("error", (err) => {
			console.error(`Post-connection error: ${err}`);
		});
	} catch (err) {
		console.error(`Initial connection error: ${(err as Error).message}`);
		process.exit(1);
	}
};

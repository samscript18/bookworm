import { config } from "dotenv";

config();

const secrets = {
	port: <number | string>process.env.PORT,
	mongoUri: <string>process.env.MONGO_URI,
	jwtSecret: <string>process.env.JWT_SECRET,
	cloudinaryCloudName: <string>process.env.CLOUDINARY_CLOUD_NAME,
	cloudinaryApiKey: <string>process.env.CLOUDINARY_API_KEY,
	cloudinaryApiSecret: <string>process.env.CLOUDINARY_API_SECRET,
	apiUrl: <string>process.env.API_URL,
	mailerUser: <string>process.env.MAILER_USER,
	mailerPass: <string>process.env.MAILER_PASS,
	googleClientId: <string>process.env.GOOGLE_CLIENT_ID,
	googleClientSecret: <string>process.env.GOOGLE_CLIENT_SECRET,
	firebaseProjectId: <string>process.env.FIREBASE_PROJECT_ID,
	firebasePrivateKey: <string>process.env.FIREBASE_PRIVATE_KEY,
	firebaseClientEmail: <string>process.env.FIREBASE_CLIENT_EMAIL,
};
export default secrets;

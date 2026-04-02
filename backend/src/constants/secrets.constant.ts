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
};
export default secrets;

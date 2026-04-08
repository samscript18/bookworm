import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import secrets from "../constants/secrets.constant";
import multer from "multer";

cloudinary.config({
	cloud_name: secrets.cloudinaryCloudName,
	api_key: secrets.cloudinaryApiKey,
	api_secret: secrets.cloudinaryApiSecret,
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: async (req, file) => {
		return {
			folder: "bookworm",
			allowed_formats: ["jpg", "png", "jpeg", "webp"],
			public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
			secure: true,
		};
	},
});

export const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith("image/")) cb(null, true);
		else cb(new Error("Only images are allowed"));
	},
});

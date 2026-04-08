import { Request, Response } from "express";
import { UploadService } from "../services/upload.service";

export const uploadSingleImage = async (req: Request, res: Response) => {
	try {
		const imageUrl = UploadService.processSingleUpload(req.file);

		return res.status(200).json({
			success: true,
			message: "Image uploaded successfully",
			data: { url: imageUrl },
		});
	} catch (error: any) {
		return res.status(error.message === "No file provided" ? 400 : 500).json({
			success: false,
			message: error.message || "Upload failed",
		});
	}
};

export const uploadMultipleImages = async (req: Request, res: Response) => {
	try {
		const imageUrls = UploadService.processMultipleUploads(req.files as Express.Multer.File[]);

		return res.status(200).json({
			success: true,
			message: `${imageUrls.length} images uploaded successfully`,
			data: { urls: imageUrls },
		});
	} catch (error: any) {
		return res.status(error.message === "No files provided" ? 400 : 500).json({
			success: false,
			message: error.message || "Bulk upload failed",
		});
	}
};

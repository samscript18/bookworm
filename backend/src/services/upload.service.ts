export class UploadService {
	static processSingleUpload(file?: Express.Multer.File): string {
		if (!file) {
			throw new Error("No file provided");
		}
		return (file as any).path;
	}

	static processMultipleUploads(files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }): string[] {
		if (!files || (Array.isArray(files) && files.length === 0)) {
			throw new Error("No files provided");
		}

		const fileArray = Array.isArray(files) ? files : Object.values(files).flat();

		return fileArray.map((file: any) => file.path);
	}
}

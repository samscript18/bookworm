import express, { Express } from "express";
import secrets from "./constants/secrets.constant";
import { errorHandler } from "./middleware/errorHandler";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { rootRouter } from "./routes";

dotenv.config();

const app: Express = express();
app.use(express.json());

app.use("/api", rootRouter);

app.get("/", (req, res) => {
	res.send("<h1>BookWorm API</h1>");
});

app.use(errorHandler);

const startServer = async () => {
	try {
		await connectDB();
		const port = secrets.port;
		app.listen(port, () => {
			console.log(`⚡[server]: connected successfully on http://localhost:${port}`);
		});
	} catch (error) {
		console.error("❌ Critical: Failed to start server:", error);
		process.exit(1);
	}
};

startServer();

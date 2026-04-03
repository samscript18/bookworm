import express, { Express } from "express";
import secrets from "./constants/secrets.constant";
import { errorHandler } from "./middleware/errorHandler";
import { connectDB } from "./config/db";
import { rootRouter } from "./routes";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

const app: Express = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
	cors({
		origin: "*",
	}),
);

app.use(express.json({ limit: "5mb" }));

app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
	}),
);

app.get("/", (req, res) => {
	res.send("<h1>BookWorm API</h1>");
});

app.use("/api", rootRouter);

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

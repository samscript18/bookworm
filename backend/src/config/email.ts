import * as nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "node:path";
import { fileURLToPath } from "node:url";
import secrets from "../constants/secrets.constant";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesPath = path.resolve(__dirname, "../templates");

async function transporter() {
	const account = {
		user: secrets.mailerUser,
		pass: secrets.mailerPass,
	};

	const mailer = await nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: account.user,
			pass: account.pass,
		},
	});

	mailer.use(
		"compile",
		hbs({
			viewEngine: {
				partialsDir: templatesPath,
				layoutsDir: templatesPath,
				extname: ".hbs",
				defaultLayout: false,
			},
			viewPath: templatesPath,
			extName: ".hbs",
		} as any),
	);

	return mailer;
}

export { transporter };

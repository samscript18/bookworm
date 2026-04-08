import admin from "firebase-admin";
import secrets from "../constants/secrets.constant";

admin.initializeApp({
	credential: admin.credential.cert({
		projectId: secrets.firebaseProjectId,
		clientEmail: secrets.firebaseClientEmail,
		privateKey: secrets.firebasePrivateKey.replace(/\\n/g, "\n"),
	}),
});

export const messaging = admin.messaging();

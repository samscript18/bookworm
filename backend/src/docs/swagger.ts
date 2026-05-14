import type { Express } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerSpec = {
	openapi: "3.0.3",
	info: {
		title: "BookWorm API",
		version: "1.0.0",
		description: "Complete API documentation for BookWorm backend endpoints.",
	},
	servers: [{ url: "/api", description: "API base path" }],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
		schemas: {
			ErrorResponse: {
				type: "object",
				required: ["success", "message"],
				properties: {
					success: { type: "boolean", example: false },
					message: { type: "string", example: "Validation error" },
					errorCode: { type: "string", nullable: true, example: "UNPROCESSABLE_ENTITY" },
					errors: { type: "object", nullable: true },
				},
			},
			User: {
				type: "object",
				properties: {
					_id: { type: "string", example: "67f4118d0d293f0845a84af1" },
					firstName: { type: "string", example: "Jane" },
					lastName: { type: "string", example: "Doe" },
					userName: { type: "string", example: "janedoe" },
					email: { type: "string", format: "email", example: "jane@example.com" },
					profileImage: { type: "string", format: "uri" },
					bio: { type: "string", example: "Avid fantasy reader" },
					followersCount: { type: "integer", example: 12 },
					followingCount: { type: "integer", example: 20 },
					reviewsCount: { type: "integer", example: 7 },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Book: {
				type: "object",
				properties: {
					_id: { type: "string", example: "67f41aa90d293f0845a84b31" },
					title: { type: "string", example: "The Name of the Wind" },
					author: { type: "string", example: "Patrick Rothfuss" },
					description: { type: "string", example: "Epic fantasy debut novel." },
					coverImage: { type: "string", format: "uri" },
					pages: { type: "integer", example: 662 },
					publisher: { type: "string", example: "DAW Books" },
					publishYear: { type: "integer", example: 2007 },
					isbn: { type: "string", example: "9780756404741" },
					genres: { type: "array", items: { type: "string" }, example: ["Fantasy"] },
					tags: { type: "array", items: { type: "string" }, example: ["Popular", "Epic"] },
					averageRating: { type: "number", example: 4.5 },
					totalReviews: { type: "integer", example: 1280 },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Review: {
				type: "object",
				properties: {
					_id: { type: "string", example: "67f4206d0d293f0845a84b8c" },
					user: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
					book: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Book" }] },
					rating: { type: "number", example: 5 },
					content: { type: "string", example: "Excellent pacing and world building." },
					tags: { type: "array", items: { type: "string" }, example: ["must-read"] },
					likesCount: { type: "integer", example: 42 },
					commentsCount: { type: "integer", example: 6 },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			Comment: {
				type: "object",
				properties: {
					_id: { type: "string", example: "67f425060d293f0845a84bed" },
					review: { type: "string", example: "67f4206d0d293f0845a84b8c" },
					user: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
					content: { type: "string", example: "Totally agree with this take." },
					likes: { type: "array", items: { type: "string" } },
					parentComment: { type: "string", nullable: true },
					repliesCount: { type: "integer", example: 1 },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			RegisterRequest: {
				type: "object",
				required: ["firstName", "lastName", "userName", "email", "password"],
				properties: {
					firstName: { type: "string", minLength: 3 },
					lastName: { type: "string", minLength: 3 },
					userName: { type: "string", minLength: 4 },
					email: { type: "string", format: "email" },
					password: { type: "string", minLength: 8, maxLength: 20 },
					profileImage: { type: "string", format: "uri" },
					bio: { type: "string", maxLength: 300 },
				},
			},
			LoginRequest: {
				type: "object",
				required: ["email", "password"],
				properties: {
					email: { type: "string", format: "email" },
					password: { type: "string" },
				},
			},
			GoogleAuthRequest: {
				type: "object",
				required: ["idToken"],
				properties: {
					idToken: { type: "string", minLength: 1 },
				},
			},
			ForgotPasswordRequest: {
				type: "object",
				required: ["email"],
				properties: {
					email: { type: "string", format: "email" },
				},
			},
			ResetPasswordRequest: {
				type: "object",
				required: ["token", "password"],
				properties: {
					token: { type: "string", minLength: 6, maxLength: 6 },
					password: { type: "string", minLength: 8, maxLength: 20 },
				},
			},
			ChangePasswordRequest: {
				type: "object",
				required: ["currentPassword", "newPassword"],
				properties: {
					currentPassword: { type: "string", minLength: 8, maxLength: 20 },
					newPassword: { type: "string", minLength: 8, maxLength: 20 },
				},
			},
			EditProfileRequest: {
				type: "object",
				properties: {
					firstName: { type: "string", minLength: 3 },
					lastName: { type: "string", minLength: 3 },
					userName: { type: "string", minLength: 4 },
					email: { type: "string", format: "email" },
					profileImage: { type: "string", format: "uri" },
					bio: { type: "string", maxLength: 300 },
				},
			},
			UpdatePreferencesRequest: {
				type: "object",
				properties: {
					pushNotifications: { type: "boolean", example: true },
				},
			},
			UpdatePreferencesSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "User preferences updated successfully" },
					data: {
						type: "object",
						properties: {
							pushNotifications: { type: "boolean", example: true },
						},
					},
				},
			},
			FcmTokenRequest: {
				type: "object",
				required: ["fcmToken", "platform"],
				properties: {
					fcmToken: { type: "string", minLength: 10, example: "fcm_device_token_abc123xyz" },
					platform: { type: "string", enum: ["ios", "android"], example: "ios" },
				},
			},
			CreateBookRequest: {
				type: "object",
				required: ["title", "author", "description", "coverImage"],
				properties: {
					title: { type: "string" },
					author: { type: "string" },
					description: { type: "string" },
					coverImage: { type: "string", format: "uri" },
					pages: { type: "integer", minimum: 1 },
					publisher: { type: "string" },
					publishYear: { type: "integer" },
					isbn: { type: "string" },
					genres: { type: "array", items: { type: "string" } },
					tags: { type: "array", items: { type: "string" } },
				},
			},
			PostReviewRequest: {
				type: "object",
				required: ["rating", "content"],
				properties: {
					rating: { type: "number", minimum: 1, maximum: 5 },
					content: { type: "string", minLength: 1, maxLength: 3000 },
					tags: { type: "array", items: { type: "string" } },
				},
			},
			EditReviewRequest: {
				type: "object",
				properties: {
					rating: { type: "number", minimum: 1, maximum: 5 },
					content: { type: "string", minLength: 1, maxLength: 3000 },
					tags: { type: "array", items: { type: "string" } },
				},
			},
			AddCommentRequest: {
				type: "object",
				required: ["content"],
				properties: {
					content: { type: "string", minLength: 1 },
					parentCommentId: { type: "string" },
				},
			},
			EditCommentRequest: {
				type: "object",
				required: ["content"],
				properties: {
					content: { type: "string", minLength: 1 },
				},
			},
			ReactToReviewRequest: {
				type: "object",
				properties: {
					like: {
						type: "boolean",
						description: "Optional. May be ignored by current implementation.",
					},
				},
			},
			AuthSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "User logged in successfully" },
					data: {
						type: "object",
						properties: {
							token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
							user: { $ref: "#/components/schemas/User" },
						},
					},
				},
			},
			UserSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "User data retrieved successfully" },
					data: { $ref: "#/components/schemas/User" },
				},
			},
			BookSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Book fetched successfully" },
					data: { $ref: "#/components/schemas/Book" },
				},
			},
			BooksListSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "All books fetched successfully" },
					data: {
						type: "object",
						properties: {
							books: { type: "array", items: { $ref: "#/components/schemas/Book" } },
							nextCursor: { type: "string", format: "date-time", nullable: true },
						},
					},
				},
			},
			ReviewSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Review posted successfully" },
					data: { $ref: "#/components/schemas/Review" },
				},
			},
			ReviewsListSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Reviews for book retrieved successfully" },
					data: { type: "array", items: { $ref: "#/components/schemas/Review" } },
				},
			},
			ReviewFeedSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Home feed retrieved successfully" },
					data: {
						type: "object",
						properties: {
							reviews: { type: "array", items: { $ref: "#/components/schemas/Review" } },
							nextCursor: { type: "string", format: "date-time", nullable: true },
						},
					},
				},
			},
			CommentSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Comment updated successfully" },
					data: { $ref: "#/components/schemas/Comment" },
				},
			},
			CommentsListSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Comments retrieved successfully" },
					data: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
				},
			},
			MessageOnlySuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Operation completed successfully" },
				},
			},
			ToggleReactionResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Reaction applied successfully" },
					data: { type: "object" },
				},
			},
			UploadSingleSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Image uploaded successfully" },
					data: {
						type: "object",
						properties: {
							url: { type: "string", format: "uri", example: "https://res.cloudinary.com/demo/image/upload/v1/bookworm/image.jpg" },
						},
					},
				},
			},
			UploadBulkSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "3 images uploaded successfully" },
					data: {
						type: "object",
						properties: {
							urls: { type: "array", items: { type: "string", format: "uri" } },
						},
					},
				},
			},
			ExistenceCheckResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Email already exists" },
					data: {
						type: "object",
						properties: {
							exists: { type: "boolean", example: true },
						},
					},
				},
			},
			Genre: {
				type: "object",
				properties: {
					name: { type: "string", example: "Fantasy" },
					count: { type: "integer", example: 42 },
				},
			},
			GenresSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "All genres fetched successfully" },
					data: {
						type: "array",
						items: { $ref: "#/components/schemas/Genre" },
					},
					meta: {
						type: "object",
						properties: {
							count: { type: "integer", example: 28 },
						},
					},
				},
			},
			TrendingGenresSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Trending genres fetched successfully" },
					data: {
						type: "array",
						items: { $ref: "#/components/schemas/Genre" },
					},
				},
			},
			Notification: {
				type: "object",
				properties: {
					_id: { type: "string" },
					recipient: { type: "string" },
					sender: { type: "string" },
					type: { type: "string", example: "review.like", enum: ["user.folow", "review.like", "review.reply", "comment.reply", "comment.like"] },
					category: { type: "string", example: "all" },
					entityId: { type: "string", nullable: true },
					metadata: {
						type: "object",
						properties: {
							bookTitle: { type: "string" },
							bookCover: { type: "string", format: "uri" },
							textSnippet: { type: "string" },
						},
						nullable: true,
					},
					isRead: { type: "boolean", example: false },
					createdAt: { type: "string", format: "date-time" },
					updatedAt: { type: "string", format: "date-time" },
				},
			},
			NotificationGroup: {
				type: "object",
				properties: {
					_id: {
						type: "object",
						properties: {
							type: { type: "string", example: "review.like" },
							entityId: { type: "string", nullable: true },
							day: { type: "string", example: "2026-05-12" },
						},
					},
					latestSender: { type: "string" },
					senderInfo: { $ref: "#/components/schemas/User" },
					count: { type: "integer", example: 3 },
					metadata: {
						type: "object",
						properties: {
							bookTitle: { type: "string" },
							bookCover: { type: "string", format: "uri" },
							textSnippet: { type: "string" },
						},
						nullable: true,
					},
					createdAt: { type: "string", format: "date-time" },
				},
			},
			NotificationSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Notification marked as read" },
					data: { $ref: "#/components/schemas/Notification" },
				},
			},
			NotificationsBulkReadResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "All notifications marked as read" },
					data: { type: "object" },
				},
			},
			NotificationsListSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Notifications fetched successfully" },
					data: {
						type: "object",
						properties: {
							data: { type: "array", items: { $ref: "#/components/schemas/NotificationGroup" } },
							nextCursor: { type: "string", format: "date-time", nullable: true },
						},
					},
				},
			},
			NotificationsUnreadCountResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
					message: { type: "string", example: "Unread count fetched successfully" },
					data: {
						type: "object",
						properties: {
							count: { type: "integer", example: 12 },
						},
					},
				},
			},
			SimpleSuccessResponse: {
				type: "object",
				properties: {
					success: { type: "boolean", example: true },
				},
			},
		},
	},
	paths: {
		"/auth/check-email": {
			post: {
				tags: ["Auth"],
				summary: "Check if email exists",
				requestBody: {
					required: true,
					content: { "application/json": { schema: { type: "object", required: ["email"], properties: { email: { type: "string", format: "email", example: "test@example.com" } } } } },
				},
				responses: {
					200: { description: "Email existence checked", content: { "application/json": { schema: { $ref: "#/components/schemas/ExistenceCheckResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/auth/check-username": {
			post: {
				tags: ["Auth"],
				summary: "Check if username exists",
				requestBody: {
					required: true,
					content: { "application/json": { schema: { type: "object", required: ["username"], properties: { username: { type: "string", example: "johndoe", minLength: 4 } } } } },
				},
				responses: {
					200: { description: "Username existence checked", content: { "application/json": { schema: { $ref: "#/components/schemas/ExistenceCheckResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/auth/signup": {
			post: {
				tags: ["Auth"],
				summary: "Register a new user",
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
				},
				responses: {
					201: { description: "User registered", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccessResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/auth/login": {
			post: {
				tags: ["Auth"],
				summary: "Login user",
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
				},
				responses: {
					200: { description: "User logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccessResponse" } } } },
					401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/auth/forgot-password": {
			post: {
				tags: ["Auth"],
				summary: "Start password reset",
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/ForgotPasswordRequest" } } },
				},
				responses: {
					200: { description: "Password reset token sent", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageOnlySuccessResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/auth/reset-password": {
			post: {
				tags: ["Auth"],
				summary: "Complete password reset",
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordRequest" } } },
				},
				responses: {
					200: { description: "Password reset successful", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageOnlySuccessResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/auth/google": {
			post: {
				tags: ["Auth"],
				summary: "Authenticate with Google",
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/GoogleAuthRequest" } } },
				},
				responses: {
					200: { description: "Google authentication successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccessResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/users/me": {
			get: {
				tags: ["Users"],
				summary: "Get current user profile",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "query", name: "userId", schema: { type: "string" }, description: "Optional. Fetch another user's profile." }],
				responses: {
					200: { description: "Profile retrieved", content: { "application/json": { schema: { $ref: "#/components/schemas/UserSuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
			patch: {
				tags: ["Users"],
				summary: "Edit current user profile",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/EditProfileRequest" } } },
				},
				responses: {
					200: { description: "Profile updated", content: { "application/json": { schema: { $ref: "#/components/schemas/UserSuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/users/me/change-password": {
			patch: {
				tags: ["Users"],
				summary: "Change current user password",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } },
				},
				responses: {
					200: { description: "Password changed", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageOnlySuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/users/me/preferences": {
			patch: {
				tags: ["Users"],
				summary: "Update current user preferences",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePreferencesRequest" } } },
				},
				responses: {
					200: { description: "Preferences updated", content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePreferencesSuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/users/me/update-fcm-token": {
			post: {
				tags: ["Users"],
				summary: "Register a device FCM token",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/FcmTokenRequest" } } },
				},
				responses: {
					200: { description: "Device token registered", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageOnlySuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/users/me/remove-fcm-token": {
			delete: {
				tags: ["Users"],
				summary: "Remove a device FCM token",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/FcmTokenRequest" } } },
				},
				responses: {
					200: { description: "Device token removed", content: { "application/json": { schema: { $ref: "#/components/schemas/SimpleSuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/users/{userId}/react": {
			post: {
				tags: ["Users"],
				summary: "Follow or unfollow a user",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "User reaction applied", content: { "application/json": { schema: { $ref: "#/components/schemas/ToggleReactionResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/books": {
			post: {
				tags: ["Books"],
				summary: "Create a book",
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/CreateBookRequest" } } },
				},
				responses: {
					201: { description: "Book created", content: { "application/json": { schema: { $ref: "#/components/schemas/BookSuccessResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
			get: {
				tags: ["Books"],
				summary: "Get books with pagination and filters",
				security: [{ bearerAuth: [] }],
				parameters: [
					{ in: "query", name: "cursor", schema: { type: "string" }, description: "Cursor for pagination (ISO date string)" },
					{ in: "query", name: "limit", schema: { type: "number", minimum: 1 } },
					{ in: "query", name: "search", schema: { type: "string" } },
					{ in: "query", name: "genre", schema: { type: "string" } },
				],
				responses: {
					200: { description: "Books fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/BooksListSuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/books/trending": {
			get: {
				tags: ["Books"],
				summary: "Get trending books",
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Trending books fetched",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										message: { type: "string", example: "Trending books fetched successfully" },
										data: { type: "array", items: { $ref: "#/components/schemas/Book" } },
									},
								},
							},
						},
					},
				},
			},
		},
		"/books/saved": {
			get: {
				tags: ["Books"],
				summary: "Get books saved by current user",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "query", name: "userId", schema: { type: "string" }, description: "Optional. Defaults to the current user." }],
				responses: {
					200: {
						description: "Saved books fetched",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										success: { type: "boolean", example: true },
										message: { type: "string", example: "Saved books fetched successfully" },
										data: { type: "array", items: { $ref: "#/components/schemas/Book" } },
									},
								},
							},
						},
					},
				},
			},
		},
		"/books/genres/trending": {
			get: {
				tags: ["Books"],
				summary: "Get trending genres",
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "Trending genres fetched",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/TrendingGenresSuccessResponse" },
							},
						},
					},
				},
			},
		},
		"/books/genres/all": {
			get: {
				tags: ["Books"],
				summary: "Get all genres",
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "All genres fetched",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/GenresSuccessResponse" },
							},
						},
					},
				},
			},
		},
		"/books/{bookId}": {
			get: {
				tags: ["Books"],
				summary: "Get a single book by id",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "bookId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "Book fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/BookSuccessResponse" } } } },
					404: { description: "Book not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/books/{bookId}/react": {
			post: {
				tags: ["Books"],
				summary: "Save or unsave a book",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "bookId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "Book reaction applied", content: { "application/json": { schema: { $ref: "#/components/schemas/ToggleReactionResponse" } } } },
					404: { description: "Book or user not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/notifications": {
			get: {
				tags: ["Notifications"],
				summary: "Fetch authenticated user notifications",
				security: [{ bearerAuth: [] }],
				parameters: [
					{ in: "query", name: "category", schema: { type: "string", enum: ["all", "mentions"] }, default: "all", description: "Filter notifications by category" },
					{ in: "query", name: "cursor", schema: { type: "string", format: "date-time" } },
					{ in: "query", name: "limit", schema: { type: "number", minimum: 1, maximum: 100 }, default: 20 },
				],
				responses: {
					200: { description: "Notifications fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationsListSuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/notifications/{notificationId}/mark-as-read": {
			patch: {
				tags: ["Notifications"],
				summary: "Mark a notification as read",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "notificationId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "Notification marked as read", content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationSuccessResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
					404: { description: "Notification not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/notifications/mark-all-as-read": {
			patch: {
				tags: ["Notifications"],
				summary: "Mark all notifications as read",
				security: [{ bearerAuth: [] }],
				responses: {
					200: { description: "All notifications marked as read", content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationsBulkReadResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/notifications/unread-count": {
			get: {
				tags: ["Notifications"],
				summary: "Get unread notifications count",
				security: [{ bearerAuth: [] }],
				responses: {
					200: { description: "Unread count fetched successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/NotificationsUnreadCountResponse" } } } },
					401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/reviews/home-feed": {
			get: {
				tags: ["Reviews"],
				summary: "Get personalized home feed",
				security: [{ bearerAuth: [] }],
				parameters: [
					{ in: "query", name: "cursor", schema: { type: "string", format: "date-time" } },
					{ in: "query", name: "limit", schema: { type: "number", minimum: 1 }, example: 100 },
				],
				responses: {
					200: { description: "Home feed fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewFeedSuccessResponse" } } } },
					422: { description: "Invalid cursor", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/reviews/user/{userId}": {
			get: {
				tags: ["Reviews"],
				summary: "Get reviews posted by user",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "User reviews fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewsListSuccessResponse" } } } },
				},
			},
		},
		"/reviews/book/{bookId}": {
			get: {
				tags: ["Reviews"],
				summary: "Get all reviews for a book",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "bookId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "Book reviews fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewsListSuccessResponse" } } } },
				},
			},
		},
		"/reviews/{bookId}": {
			post: {
				tags: ["Reviews"],
				summary: "Post a review for a book",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "bookId", required: true, schema: { type: "string" } }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/PostReviewRequest" } } },
				},
				responses: {
					200: { description: "Review posted", content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewSuccessResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/reviews/{reviewId}": {
			patch: {
				tags: ["Reviews"],
				summary: "Edit an existing review",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "reviewId", required: true, schema: { type: "string" } }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/EditReviewRequest" } } },
				},
				responses: {
					200: { description: "Review edited", content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewSuccessResponse" } } } },
					404: { description: "Review not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
			delete: {
				tags: ["Reviews"],
				summary: "Delete a review",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "reviewId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "Review deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageOnlySuccessResponse" } } } },
					404: { description: "Review not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/reviews/{reviewId}/comment": {
			post: {
				tags: ["Reviews"],
				summary: "Add comment to a review",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "reviewId", required: true, schema: { type: "string" } }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/AddCommentRequest" } } },
				},
				responses: {
					201: { description: "Comment added", content: { "application/json": { schema: { $ref: "#/components/schemas/CommentSuccessResponse" } } } },
					422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/reviews/{reviewId}/comments": {
			get: {
				tags: ["Reviews"],
				summary: "Get comments for a review",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "reviewId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "Comments fetched", content: { "application/json": { schema: { $ref: "#/components/schemas/CommentsListSuccessResponse" } } } },
				},
			},
		},
		"/reviews/{reviewId}/react": {
			post: {
				tags: ["Reviews"],
				summary: "Like or unlike a review",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "reviewId", required: true, schema: { type: "string" } }],
				requestBody: {
					required: false,
					content: { "application/json": { schema: { $ref: "#/components/schemas/ReactToReviewRequest" } } },
				},
				responses: {
					200: { description: "Review reaction applied", content: { "application/json": { schema: { $ref: "#/components/schemas/ToggleReactionResponse" } } } },
					404: { description: "Review not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/comments/{commentId}": {
			patch: {
				tags: ["Comments"],
				summary: "Edit a comment",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "commentId", required: true, schema: { type: "string" } }],
				requestBody: {
					required: true,
					content: { "application/json": { schema: { $ref: "#/components/schemas/EditCommentRequest" } } },
				},
				responses: {
					200: { description: "Comment edited", content: { "application/json": { schema: { $ref: "#/components/schemas/CommentSuccessResponse" } } } },
					404: { description: "Comment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
			delete: {
				tags: ["Comments"],
				summary: "Delete a comment",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "commentId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "Comment deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageOnlySuccessResponse" } } } },
					404: { description: "Comment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/comments/{commentId}/react": {
			post: {
				tags: ["Comments"],
				summary: "Like or unlike a comment",
				security: [{ bearerAuth: [] }],
				parameters: [{ in: "path", name: "commentId", required: true, schema: { type: "string" } }],
				responses: {
					200: { description: "Comment reaction applied", content: { "application/json": { schema: { $ref: "#/components/schemas/ToggleReactionResponse" } } } },
					404: { description: "Comment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/upload/single": {
			post: {
				tags: ["Upload"],
				summary: "Upload one image",
				// security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								required: ["image"],
								properties: {
									image: {
										type: "string",
										format: "binary",
										description: "Image file to upload",
									},
								},
							},
							encoding: {
								image: {
									contentType: "image/*",
								},
							},
						},
					},
				},
				responses: {
					200: { description: "Image uploaded", content: { "application/json": { schema: { $ref: "#/components/schemas/UploadSingleSuccessResponse" } } } },
					400: { description: "No file provided", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
		"/upload/bulk": {
			post: {
				tags: ["Upload"],
				summary: "Upload multiple images (max 5)",
				// security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								required: ["images"],
								properties: {
									images: {
										type: "array",
										items: {
											type: "string",
											format: "binary",
										},
										description: "Up to 5 image files",
										maxItems: 5,
									},
								},
							},
							encoding: {
								images: {
									contentType: "image/*",
								},
							},
						},
					},
				},
				responses: {
					200: { description: "Images uploaded", content: { "application/json": { schema: { $ref: "#/components/schemas/UploadBulkSuccessResponse" } } } },
					400: { description: "No files provided", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
				},
			},
		},
	},
} as const;

export const setupSwagger = (app: Express) => {
	app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
};

export { swaggerSpec };

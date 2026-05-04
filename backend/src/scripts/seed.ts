import mongoose, { Types } from "mongoose";
import { connectDB } from "../config/db";
import { Book, IBook } from "../models/book.model";
import { Comment, IComment } from "../models/comment.model";
import { Notification, NotificationCategory, NotificationType } from "../models/notification.model";
import { Review, IReview } from "../models/review.model";
import { User, IUser } from "../models/user.model";
import { hashPassword } from "../utils/helpers/helper";

type SeedConfig = {
	reset: boolean;
	users: number;
	books: number;
	reviews: number;
	comments: number;
	notifications: number;
};

const firstNames = ["Ava", "Liam", "Noah", "Emma", "Mia", "Lucas", "Ella", "Amara", "Mason", "Chloe", "Ethan", "Olivia", "Sofia", "Logan", "Nora", "Zoe", "Aria", "Ivy", "Leo", "Rina", "Kai", "Mila", "Jules", "Harper"];

const lastNames = ["Bennett", "Carter", "Diaz", "Everett", "Fischer", "Gibson", "Hayes", "Ibrahim", "Jensen", "Kim", "Lopez", "Morris", "Novak", "Owens", "Patel", "Quinn", "Reed", "Shaw", "Turner", "Usman", "Valdez", "Walker", "Xu", "Young"];

const genres = [
	"Fantasy",
	"Science Fiction",
	"Mystery",
	"Romance",
	"Historical Fiction",
	"Thriller",
	"Horror",
	"Memoir",
	"Biography",
	"Self Help",
	"Business",
	"Young Adult",
	"Poetry",
	"Classics",
	"Adventure",
	"Literary",
	"Dystopian",
	"Philosophy",
	"Psychology",
	"Productivity",
];

const adjectives = ["Silent", "Golden", "Hidden", "Last", "Shattered", "Burning", "Fading", "Secret", "Restless", "Electric", "Glass", "Forgotten", "Midnight", "Broken", "Brave", "Ancient", "Wandering", "Crimson", "Infinite", "Blue"];

const nouns = ["Library", "Garden", "Empire", "Sea", "Echo", "Map", "Forest", "Clock", "Dream", "Labyrinth", "City", "Signal", "Archive", "Compass", "Crown", "Valley", "Storm", "River", "Machine", "Kingdom"];

const bookTags = ["bestseller", "slow-burn", "plot-twist", "character-driven", "worldbuilding", "short-read", "series", "debut", "award-winning", "book-club", "emotional", "dark-academia", "cozy", "thought-provoking", "fast-paced", "coming-of-age"];

const reviewTags = ["insightful", "spoiler-free", "critical", "balanced", "enthusiastic", "dnf", "favorite", "recommend", "deep-dive", "quick-thoughts"];

const bioFragments = [
	"Usually reading after midnight.",
	"Collects annotated paperbacks.",
	"Believes every mood has a perfect book.",
	"Always chasing five-star reads.",
	"Takes notes in the margins.",
	"Builds monthly reading challenges.",
	"Loves character-driven stories.",
	"Reads one chapter before work.",
	"Bookmarks beautiful passages.",
	"Always borrowing one more book.",
];

function parseArgNumber(name: string): number | undefined {
	const prefix = `--${name}=`;
	const found = process.argv.find((arg) => arg.startsWith(prefix));
	if (!found) return undefined;
	const raw = found.slice(prefix.length);
	const value = Number(raw);
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
}

function parseArgBoolean(name: string): boolean | undefined {
	const prefix = `--${name}=`;
	const found = process.argv.find((arg) => arg.startsWith(prefix));
	if (!found) return undefined;
	const raw = found.slice(prefix.length).trim().toLowerCase();
	if (["true", "1", "yes", "y"].includes(raw)) return true;
	if (["false", "0", "no", "n"].includes(raw)) return false;
	return undefined;
}

function parseEnvNumber(name: string): number | undefined {
	const raw = process.env[name];
	if (!raw) return undefined;
	const value = Number(raw);
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
}

function parseEnvBoolean(name: string): boolean | undefined {
	const raw = process.env[name];
	if (!raw) return undefined;
	const value = raw.trim().toLowerCase();
	if (["true", "1", "yes", "y"].includes(value)) return true;
	if (["false", "0", "no", "n"].includes(value)) return false;
	return undefined;
}

function getConfig(): SeedConfig {
	const defaults: SeedConfig = {
		reset: true,
		users: 50,
		books: 180,
		reviews: 900,
		comments: 2200,
		notifications: 800,
	};

	return {
		reset: parseArgBoolean("reset") ?? parseEnvBoolean("SEED_RESET") ?? defaults.reset,
		users: parseArgNumber("users") ?? parseEnvNumber("SEED_USERS") ?? defaults.users,
		books: parseArgNumber("books") ?? parseEnvNumber("SEED_BOOKS") ?? defaults.books,
		reviews: parseArgNumber("reviews") ?? parseEnvNumber("SEED_REVIEWS") ?? defaults.reviews,
		comments: parseArgNumber("comments") ?? parseEnvNumber("SEED_COMMENTS") ?? defaults.comments,
		notifications: parseArgNumber("notifications") ?? parseEnvNumber("SEED_NOTIFICATIONS") ?? defaults.notifications,
	};
}

function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(arr: T[]): T {
	return arr[randInt(0, arr.length - 1)] as T;
}

function shuffle<T>(items: T[]): T[] {
	const clone = [...items];
	for (let i = clone.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const tmp = clone[i] as T;
		clone[i] = clone[j] as T;
		clone[j] = tmp;
	}
	return clone;
}

function pickManyUnique<T>(arr: T[], count: number): T[] {
	if (count <= 0) return [];
	return shuffle(arr).slice(0, Math.min(count, arr.length));
}

function randomDateWithinDays(days: number): Date {
	const now = Date.now();
	const back = randInt(0, days * 24 * 60 * 60 * 1000);
	return new Date(now - back);
}

function makeParagraph(wordPool: string[], minWords: number, maxWords: number): string {
	const wordCount = randInt(minWords, maxWords);
	const words: string[] = [];
	for (let i = 0; i < wordCount; i++) {
		words.push(pickOne(wordPool).toLowerCase());
	}
	const sentence = words.join(" ");
	return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function makeReviewContent(): string {
	const pool = [...adjectives, ...nouns, ...bookTags.map((t) => t.replace("-", " ")), ...genres.map((g) => g.replace(" ", " "))];
	const parts = [makeParagraph(pool, 18, 28), makeParagraph(pool, 14, 24)];
	if (Math.random() > 0.6) parts.push(makeParagraph(pool, 10, 18));
	return parts.join(" ");
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max));
}

function createCoverImageUrl(index: number): string {
	const tone = (index % 12) + 1;
	return `https://picsum.photos/seed/bookworm-${index + 1}-${tone}/640/960`;
}

async function clearCollections() {
	await Promise.all([Notification.deleteMany({}), Comment.deleteMany({}), Review.deleteMany({}), Book.deleteMany({}), User.deleteMany({})]);
}

async function seedUsers(config: SeedConfig) {
	const hashedPassword = await hashPassword("Passw0rd!");
	const docs: Partial<IUser>[] = [];
	const taken = new Set<string>();

	for (let i = 0; i < config.users; i++) {
		const firstName = pickOne(firstNames);
		const lastName = pickOne(lastNames);
		let userName = `${firstName}${lastName}${randInt(100, 999)}`.toLowerCase();
		while (taken.has(userName)) {
			userName = `${firstName}${lastName}${randInt(100, 999)}${randInt(1, 9)}`.toLowerCase();
		}
		taken.add(userName);

		docs.push({
			firstName,
			lastName,
			userName,
			email: `${userName}@seed.bookworm.dev`,
			password: hashedPassword,
			bio: `${pickOne(bioFragments)} ${pickOne(bioFragments)}`,
			favoriteGenres: pickManyUnique(genres, randInt(2, 5)),
			preferences: { pushNotifications: Math.random() > 0.1 },
			createdAt: randomDateWithinDays(240),
			updatedAt: randomDateWithinDays(120),
		});
	}

	const users = await User.insertMany(docs, { ordered: true });
	return users;
}

async function seedBooks(config: SeedConfig) {
	const docs: Partial<IBook>[] = [];
	const usedIsbn = new Set<string>();

	for (let i = 0; i < config.books; i++) {
		const title = `${pickOne(adjectives)} ${pickOne(nouns)}`;
		const author = `${pickOne(firstNames)} ${pickOne(lastNames)}`;
		const isbn = `978-${randInt(100, 999)}-${randInt(10000, 99999)}-${randInt(100, 999)}-${randInt(0, 9)}`;
		if (usedIsbn.has(isbn)) {
			i--;
			continue;
		}
		usedIsbn.add(isbn);

		docs.push({
			title,
			author,
			description: `${makeParagraph([...adjectives, ...nouns, ...genres], 20, 32)} ${makeParagraph([...adjectives, ...nouns, ...genres], 15, 24)}`,
			coverImage: createCoverImageUrl(i),
			pages: randInt(120, 980),
			publisher: `${pickOne(lastNames)} Press`,
			publishYear: randInt(1965, 2026),
			isbn,
			genres: pickManyUnique(genres, randInt(1, 3)),
			tags: pickManyUnique(bookTags, randInt(2, 5)),
		});
	}

	const books = await Book.insertMany(docs, { ordered: true });
	return books;
}

async function seedSocialGraph(users: IUser[]) {
	const userIds = users.map((u) => u._id as Types.ObjectId);
	const followingMap = new Map<string, Set<string>>();
	const followersMap = new Map<string, Set<string>>();

	for (const user of users) {
		const id = (user._id as Types.ObjectId).toString();
		const others = userIds.filter((target) => !target.equals(user._id as Types.ObjectId));
		const maxFollow = clamp(Math.floor(users.length * 0.2), 3, Math.max(3, users.length - 1));
		const targetCount = randInt(3, maxFollow);
		const selected = pickManyUnique(others, targetCount);
		followingMap.set(id, new Set(selected.map((s) => s.toString())));
	}

	for (const [followerId, followingSet] of followingMap) {
		for (const targetId of followingSet) {
			if (!followersMap.has(targetId)) followersMap.set(targetId, new Set());
			followersMap.get(targetId)?.add(followerId);
		}
	}

	const userBulk = users.map((user) => {
		const id = (user._id as Types.ObjectId).toString();
		const following = Array.from(followingMap.get(id) ?? []).map((x) => new Types.ObjectId(x));
		const followers = Array.from(followersMap.get(id) ?? []).map((x) => new Types.ObjectId(x));
		return {
			updateOne: {
				filter: { _id: user._id },
				update: {
					$set: {
						following,
						followers,
						followingCount: following.length,
						followersCount: followers.length,
					},
				},
			},
		};
	});

	if (userBulk.length) {
		await User.bulkWrite(userBulk);
	}

	return { followingMap, followersMap };
}

async function seedSavedBooks(users: IUser[], books: IBook[]) {
	const bookIds = books.map((b) => b._id as Types.ObjectId);
	const bulk = users.map((user) => {
		const count = randInt(6, Math.min(35, bookIds.length));
		const savedBooks = pickManyUnique(bookIds, count);
		return {
			updateOne: {
				filter: { _id: user._id },
				update: { $set: { savedBooks } },
			},
		};
	});

	if (bulk.length) {
		await User.bulkWrite(bulk);
	}
}

async function seedReviews(config: SeedConfig, users: IUser[], books: IBook[]) {
	const docs: Partial<IReview>[] = [];
	const pairSet = new Set<string>();
	const userIds = users.map((u) => u._id as Types.ObjectId);
	const bookIds = books.map((b) => b._id as Types.ObjectId);
	const maxPossible = userIds.length * bookIds.length;
	const target = Math.min(config.reviews, maxPossible);
	let attempts = 0;

	while (docs.length < target && attempts < target * 12) {
		attempts++;
		const user = pickOne(users);
		const book = pickOne(books);
		const pairKey = `${(user._id as Types.ObjectId).toString()}_${(book._id as Types.ObjectId).toString()}`;
		if (pairSet.has(pairKey)) continue;
		pairSet.add(pairKey);

		const likes = pickManyUnique(
			userIds.filter((id) => !id.equals(user._id as Types.ObjectId)),
			randInt(0, clamp(Math.floor(userIds.length * 0.25), 0, 25)),
		);

		docs.push({
			user: user._id as Types.ObjectId,
			book: book._id as Types.ObjectId,
			rating: randInt(1, 5),
			content: makeReviewContent(),
			tags: pickManyUnique(reviewTags, randInt(0, 4)),
			likes,
			commentsCount: 0,
		});
	}

	const reviews = await Review.insertMany(docs, { ordered: true });
	return reviews;
}

async function refreshBookAndUserStats(reviews: IReview[], users: IUser[], books: IBook[]) {
	const bookStats = new Map<string, { totalReviews: number; ratingSum: number }>();
	const userStats = new Map<string, { reviewsCount: number }>();

	for (const review of reviews) {
		const bookId = (review.book as Types.ObjectId).toString();
		const userId = (review.user as Types.ObjectId).toString();

		const currentBook = bookStats.get(bookId) ?? { totalReviews: 0, ratingSum: 0 };
		currentBook.totalReviews += 1;
		currentBook.ratingSum += review.rating;
		bookStats.set(bookId, currentBook);

		const currentUser = userStats.get(userId) ?? { reviewsCount: 0 };
		currentUser.reviewsCount += 1;
		userStats.set(userId, currentUser);
	}

	const bookBulk = books.map((book) => {
		const id = (book._id as Types.ObjectId).toString();
		const stats = bookStats.get(id) ?? { totalReviews: 0, ratingSum: 0 };
		const averageRating = stats.totalReviews > 0 ? Number((stats.ratingSum / stats.totalReviews).toFixed(1)) : 0;
		return {
			updateOne: {
				filter: { _id: book._id },
				update: { $set: { totalReviews: stats.totalReviews, averageRating } },
			},
		};
	});

	const userBulk = users.map((user) => {
		const id = (user._id as Types.ObjectId).toString();
		const stats = userStats.get(id) ?? { reviewsCount: 0 };
		return {
			updateOne: {
				filter: { _id: user._id },
				update: { $set: { reviewsCount: stats.reviewsCount } },
			},
		};
	});

	await Promise.all([Book.bulkWrite(bookBulk), User.bulkWrite(userBulk)]);
}

async function seedComments(config: SeedConfig, users: IUser[], reviews: IReview[]) {
	if (!reviews.length) return { comments: [] as IComment[], topLevelComments: [] as IComment[] };

	const userIds = users.map((u) => u._id as Types.ObjectId);
	const topLevelTarget = Math.floor(config.comments * 0.7);
	const replyTarget = config.comments - topLevelTarget;
	const topDocs: Partial<IComment>[] = [];

	for (let i = 0; i < topLevelTarget; i++) {
		const review = pickOne(reviews);
		const user = pickOne(users);
		const likes = pickManyUnique(
			userIds.filter((id) => !id.equals(user._id as Types.ObjectId)),
			randInt(0, clamp(Math.floor(userIds.length * 0.2), 0, 14)),
		);

		topDocs.push({
			review: review._id as Types.ObjectId,
			user: user._id as Types.ObjectId,
			content: makeParagraph([...adjectives, ...nouns, ...reviewTags], 8, 20),
			likes,
			parentComment: null,
			repliesCount: 0,
		});
	}

	const topLevelComments = await Comment.insertMany(topDocs, { ordered: true });
	const replyDocs: Partial<IComment>[] = [];

	for (let i = 0; i < replyTarget; i++) {
		const parent = pickOne(topLevelComments);
		const user = pickOne(users);
		const likes = pickManyUnique(
			userIds.filter((id) => !id.equals(user._id as Types.ObjectId)),
			randInt(0, clamp(Math.floor(userIds.length * 0.15), 0, 10)),
		);

		replyDocs.push({
			review: parent.review as Types.ObjectId,
			user: user._id as Types.ObjectId,
			content: makeParagraph([...adjectives, ...nouns, ...reviewTags], 6, 16),
			likes,
			parentComment: parent._id as Types.ObjectId,
			repliesCount: 0,
		});
	}

	const replies = await Comment.insertMany(replyDocs, { ordered: true });
	const comments = [...topLevelComments, ...replies];

	const reviewCommentCounts = new Map<string, number>();
	for (const comment of comments) {
		const reviewId = (comment.review as Types.ObjectId).toString();
		reviewCommentCounts.set(reviewId, (reviewCommentCounts.get(reviewId) ?? 0) + 1);
	}

	const reviewBulk = reviews.map((review) => {
		const count = reviewCommentCounts.get((review._id as Types.ObjectId).toString()) ?? 0;
		return {
			updateOne: {
				filter: { _id: review._id },
				update: { $set: { commentsCount: count } },
			},
		};
	});

	const repliesPerParent = new Map<string, number>();
	for (const reply of replies) {
		if (!reply.parentComment) continue;
		const parentId = (reply.parentComment as Types.ObjectId).toString();
		repliesPerParent.set(parentId, (repliesPerParent.get(parentId) ?? 0) + 1);
	}

	const parentBulk = topLevelComments.map((comment) => {
		const repliesCount = repliesPerParent.get((comment._id as Types.ObjectId).toString()) ?? 0;
		return {
			updateOne: {
				filter: { _id: comment._id },
				update: { $set: { repliesCount } },
			},
		};
	});

	await Promise.all([Review.bulkWrite(reviewBulk), Comment.bulkWrite(parentBulk)]);

	return { comments, topLevelComments };
}

async function seedNotifications(config: SeedConfig, users: IUser[], reviews: IReview[], comments: IComment[]) {
	if (users.length < 2) return [];

	const docs = [] as Array<{
		recipient: Types.ObjectId;
		sender: Types.ObjectId;
		type: NotificationType;
		category: NotificationCategory;
		entityId?: Types.ObjectId;
		metadata?: { bookTitle: string; bookCover: string; textSnippet: string };
		isRead: boolean;
		createdAt: Date;
		updatedAt: Date;
	}>;

	const reviewById = new Map<string, IReview>();
	for (const review of reviews) reviewById.set((review._id as Types.ObjectId).toString(), review);

	const uniqueBookIds = Array.from(new Set(reviews.map((review) => (review.book as Types.ObjectId).toString()))).map((id) => new Types.ObjectId(id));

	const bookDocs = await Book.find({ _id: { $in: uniqueBookIds } })
		.select("title coverImage")
		.lean();
	const bookById = new Map<string, { title: string; coverImage: string }>();
	for (const book of bookDocs) {
		bookById.set((book._id as Types.ObjectId).toString(), {
			title: book.title,
			coverImage: book.coverImage,
		});
	}

	for (let i = 0; i < config.notifications; i++) {
		const sender = pickOne(users);
		let recipient = pickOne(users);
		while ((recipient._id as Types.ObjectId).equals(sender._id as Types.ObjectId)) {
			recipient = pickOne(users);
		}

		const type = pickOne([NotificationType.userFollow, NotificationType.reviewLike, NotificationType.reviewReply, NotificationType.commentLike, NotificationType.commentReply]);

		const category = type === NotificationType.userFollow ? NotificationCategory.FOLLOWING : type === NotificationType.reviewReply || type === NotificationType.commentReply ? NotificationCategory.MENTIONS : NotificationCategory.ALL;

		let entityId: Types.ObjectId | undefined;
		let metadata: { bookTitle: string; bookCover: string; textSnippet: string } | undefined;

		if ((type === NotificationType.reviewLike || type === NotificationType.reviewReply) && reviews.length) {
			const review = pickOne(reviews);
			entityId = review._id as Types.ObjectId;
			const book = bookById.get((review.book as Types.ObjectId).toString());
			if (book) {
				metadata = {
					bookTitle: book.title,
					bookCover: book.coverImage,
					textSnippet: review.content.slice(0, 120),
				};
			}
		}

		if ((type === NotificationType.commentLike || type === NotificationType.commentReply) && comments.length) {
			const comment = pickOne(comments);
			entityId = comment._id as Types.ObjectId;
			const review = reviewById.get((comment.review as Types.ObjectId).toString());
			if (review) {
				const book = bookById.get((review.book as Types.ObjectId).toString());
				if (book) {
					metadata = {
						bookTitle: book.title,
						bookCover: book.coverImage,
						textSnippet: comment.content.slice(0, 120),
					};
				}
			}
		}

		docs.push({
			recipient: recipient._id as Types.ObjectId,
			sender: sender._id as Types.ObjectId,
			type,
			category,
			...(entityId ? { entityId } : {}),
			...(metadata ? { metadata } : {}),
			isRead: Math.random() > 0.55,
			createdAt: randomDateWithinDays(60),
			updatedAt: randomDateWithinDays(20),
		});
	}

	const notifications = await Notification.insertMany(docs, { ordered: true });
	return notifications;
}

async function seed() {
	const config = getConfig();
	console.log("[seed] Starting database seed with config:", config);

	await connectDB();

	if (config.reset) {
		console.log("[seed] Clearing existing collections...");
		await clearCollections();
	}

	console.log("[seed] Creating users...");
	const users = await seedUsers(config);

	console.log("[seed] Creating books...");
	const books = await seedBooks(config);

	console.log("[seed] Building follow graph...");
	await seedSocialGraph(users);

	console.log("[seed] Creating saved books...");
	await seedSavedBooks(users, books);

	console.log("[seed] Creating reviews...");
	const reviews = await seedReviews(config, users, books);

	console.log("[seed] Refreshing aggregate stats...");
	await refreshBookAndUserStats(reviews, users, books);

	console.log("[seed] Creating comments and replies...");
	const { comments } = await seedComments(config, users, reviews);

	console.log("[seed] Creating notifications...");
	const notifications = await seedNotifications(config, users, reviews, comments);

	console.log("[seed] Done.");
	console.log(`[seed] Summary: users=${users.length}, books=${books.length}, reviews=${reviews.length}, comments=${comments.length}, notifications=${notifications.length}`);
}

seed()
	.catch((err) => {
		console.error("[seed] Failed:", err);
		process.exitCode = 1;
	})
	.finally(async () => {
		await mongoose.disconnect();
	});

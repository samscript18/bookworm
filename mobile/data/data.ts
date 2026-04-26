import { OnboardingSlide } from "@/types/onboarding";

export const OnboardingSlides: OnboardingSlide[] = [
	{
		id: "1",
		title: "Discover Your Next\nFavorite Book",
		description: "Explore millions of books tailored to your taste and reading preferences",
		image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png",
	},
	{
		id: "2",
		title: "Join Meaningful\nConversations",
		description: "Connect with fellow readers, share insights, and discuss your favorite books in a vibrant community",
		image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-2_bc8itu.png",
	},
	{
		id: "3",
		title: "Share Your Reading\nJourney",
		description: "Rate books, write reviews, and inspire other readers with your thoughts and recommendations",
		image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-3_jbadna.png",
	},
];

// Mock Data

export const reviews = [
	{
		id: "1",
		name: "Sarah Mitchell",
		time: "2 days ago",
		text: "Absolutely captivating! This book kept me up all night. The character development is phenomenal and the plot twists are unexpected. Highly recommend to anyone who loves a good mystery.",
		helpful: 24,
		avatar: "https://randomuser.me/api/portraits/women/44.jpg",
		rating: 5,
	},
	{
		id: "2",
		name: "Michael Chen",
		time: "5 days ago",
		text: "Great read with compelling storytelling. The only reason I did not give 5 stars is because the pacing in the middle felt a bit slow. Overall, a fantastic book that I would recommend.",
		helpful: 18,
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
		rating: 4,
	},
	{
		id: "3",
		name: "Emily Rodriguez",
		time: "1 week ago",
		text: "This is hands down one of the best books I have read this year. The author has a beautiful way with words and creates such vivid imagery. Cannot wait for the sequel!",
		helpful: 31,
		avatar: "https://randomuser.me/api/portraits/women/65.jpg",
		rating: 5,
	},
];

export const bookDescription = [
	"Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices.",
	"Would you have done anything different, if you had the chance to undo your regrets? A dazzling novel about all the choices that go into a life well lived, from the internationally bestselling author of Reasons to Stay Alive and How To Stop Time.",
	"Somewhere out beyond the edge of the universe there is a library that contains an infinite number of books, each one the story of another reality. One tells the story of your life as it is, along with another book for the other life you could have lived.",
];

export const GENRES = ["All Genres", "Fiction", "Romance", "Sci-Fi", "Fantasy"];

export const CATEGORIES = [
	{ id: "1", title: "Fiction", count: "12,458", icon: "book", color: "#7C3AED" },
	{ id: "2", title: "Romance", count: "8,234", icon: "heart", color: "#EC4899" },
	{ id: "3", title: "Sci-Fi", count: "5,672", icon: "rocket", color: "#3B82F6" },
	{ id: "4", title: "Mystery", count: "6,891", icon: "glasses", color: "#374151" },
];

export const TRENDING_BOOKS = [
	{ id: "1", title: "The Midnight Library", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png", rating: 4.5, tag: "Popular" },
	{ id: "2", title: "Atomic Habits", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png", rating: 4.8, tag: "New" },
	{ id: "3", title: "Project Hail Mary", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png", rating: 4.5, tag: "Popular" },
];

export const FEED_POSTS = [
	{
		id: "1",
		user: "Sarah Mitchell",
		time: "2h ago",
		avatar: "https://i.pravatar.cc/100?img=1",
		bookTitle: "The Midnight Library",
		author: "Matt Haig",
		rating: 4.5,
		cover: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png",
		text: "This book absolutely changed my perspective on life choices and regret. Haig's writing is both poignant and hopeful...",
		likes: 324,
		comments: 28,
	},
	{
		id: "2",
		user: "Sarah Mitchell",
		time: "2h ago",
		avatar: "https://i.pravatar.cc/100?img=1",
		bookTitle: "The Midnight Library",
		author: "Matt Haig",
		rating: 4,
		cover: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png",
		text: "This book absolutely changed my perspective on life choices and regret. Haig's writing is both poignant and hopeful...",
		likes: 324,
		comments: 28,
	},
];

export const NOTIFICATIONS = [
	{ id: "1", type: "follow", user: "Emma Wilson", text: "started following you", time: "2h ago", avatar: "https://i.pravatar.cc/100?img=1" },
	{
		id: "2",
		type: "like",
		user: "James Chen",
		text: "liked your review of",
		target: "The Midnight Library",
		time: "4h ago",
		avatar: "https://i.pravatar.cc/100?img=11",
		image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png",
	},
	{ id: "3", type: "comment", user: "Olivia Martinez", text: "replied to your review:", quote: "I completely agree with your thoughts...", time: "6h ago", avatar: "https://i.pravatar.cc/100?img=9" },
	{
		id: "4",
		type: "like_multi",
		user: "Sarah and 12 others",
		text: "liked your review of",
		target: "The Silent Patient",
		time: "1d ago",
		avatars: ["https://i.pravatar.cc/100?img=12", "https://i.pravatar.cc/100?img=5", "https://i.pravatar.cc/100?img=8"],
		image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png",
	},
	{ id: "5", type: "follow", user: "Michael Brown", text: "started following you", time: "1d ago", avatar: "https://i.pravatar.cc/100?img=33" },
	{ id: "6", type: "follow", user: "Emma Wilson", text: "started following you", time: "2h ago", avatar: "https://i.pravatar.cc/100?img=1" },
	{
		id: "7",
		type: "like",
		user: "James Chen",
		text: "liked your review of",
		target: "The Midnight Library",
		time: "4h ago",
		avatar: "https://i.pravatar.cc/100?img=11",
		image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png",
	},
	{ id: "8", type: "comment", user: "Olivia Martinez", text: "replied to your review:", quote: "I completely agree with your thoughts...", time: "6h ago", avatar: "https://i.pravatar.cc/100?img=9" },
	{
		id: "9",
		type: "like_multi",
		user: "Sarah and 12 others",
		text: "liked your review of",
		target: "The Silent Patient",
		time: "1d ago",
		avatars: ["https://i.pravatar.cc/100?img=12", "https://i.pravatar.cc/100?img=5", "https://i.pravatar.cc/100?img=8"],
		image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png",
	},
	{ id: "10", type: "follow", user: "Michael Brown", text: "started following you", time: "1d ago", avatar: "https://i.pravatar.cc/100?img=33" },
];

export const LIBRARY_BOOKS = [
	{ id: "1", title: "Atomic Habits", author: "James Clear", progress: 65, totalPages: 320, status: "Reading", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "2", title: "Dune", author: "Frank Herbert", progress: 12, totalPages: 412, status: "Reading", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" }, // Add a mock image
	{ id: "3", title: "1984", author: "George Orwell", status: "To Read", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" }, // Add a mock image
	{ id: "4", title: "The Midnight Library", author: "Matt Haig", status: "Completed", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
];

export const REVIEWS_DATA = [
	{ id: "1", title: "The Midnight Library", rating: 5, text: "Absolutely captivating story about...", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "2", title: "Where the Crawdads Sing", rating: 4, text: "A beautiful tale of resilience and...", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "3", title: "The Silent Patient", rating: 5, text: "Mind-blowing psychological thriller...", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "4", title: "Educated", rating: 5, text: "Powerful memoir about transformation...", image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
];

export const CATEGORY_BOOKS = [
	{ id: "1", title: "The Midnight Library", author: "Matt Haig", rating: 4.5, image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "2", title: "Project Hail Mary", author: "Andy Weir", rating: 4.8, image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "3", title: "The Silent Patient", author: "Alex Michaelides", rating: 4.7, image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "4", title: "Educated", author: "Tara Westover", rating: 4.9, image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "5", title: "Circe", author: "Madeline Miller", rating: 4.6, image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
	{ id: "6", title: "Normal People", author: "Sally Rooney", rating: 4.2, image: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" },
];

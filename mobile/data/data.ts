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

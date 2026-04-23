import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { set } from "zod";

const Index = () => {
	const { hasCompletedOnboarding, isAuthenticated } = useAuthStore();

	// useEffect(() => {
	// 	setAccessToken(null);
	// 	setUser(null);
	// 	setIsAuthenticated(false);
	// }, []);

	if (!hasCompletedOnboarding) {
		return <Redirect href="/onboarding" />;
	}

	if (!isAuthenticated) {
		return <Redirect href="/login" />;
	}

	return <Redirect href="/home" />;
};

export default Index;

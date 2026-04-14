import { View, Text } from "react-native";
import React from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

const Index = () => {
	const { hasCompletedOnboarding, isAuthenticated } = useAuthStore();

	if (!hasCompletedOnboarding) {
		return <Redirect href="/onboarding" />;
	}

	if (!isAuthenticated) {
		return <Redirect href="/login" />;
	}

	return <Redirect href="/home" />;
};

export default Index;

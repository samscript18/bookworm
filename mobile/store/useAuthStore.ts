import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
	hasCompletedOnboarding: boolean;
	setHasCompletedOnboarding: (value: boolean) => void;
	isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			hasCompletedOnboarding: false,
			setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
			isAuthenticated: false,
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);

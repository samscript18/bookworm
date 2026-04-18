import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const Logo = () => {
	return (
		<LinearGradient
			colors={["#7C3AED", "#9D5CFF", "white"]}
			start={{ x: 0, y: 1 }}
			end={{ x: 1, y: 0 }}
			style={{
				height: 64,
				width: 64,
				borderRadius: 16,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Ionicons name="book-outline" size={36} color="white" />
		</LinearGradient>
	);
};

export default Logo;

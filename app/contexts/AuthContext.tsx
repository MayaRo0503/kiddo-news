"use client";

import {
	createContext,
	useState,
	useEffect,
	useContext,
	type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
	isLoggedIn: boolean;
	isVerified: boolean;
	isParent: boolean;
	userId: string | null;
	timeLimit: number | null;
	login: (token: string, isParent: boolean, timeLimit?: number) => void;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [isParent, setIsParent] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);
	const [timeLimit, setTimeLimit] = useState<number | null>(null);
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem("token");
		const savedTimeLimit = Number(localStorage.getItem("timeLimit")) || null;

		if (token) {
			try {
				const decodedToken = JSON.parse(atob(token.split(".")[1]));
				setIsLoggedIn(true);
				setIsVerified(decodedToken.isVerified || false);
				setIsParent(decodedToken.isParent || false);
				setUserId(decodedToken.userId || null);
				setTimeLimit(savedTimeLimit);
			} catch (error) {
				console.error("Failed to decode token:", error);
				logout();
			}
		} else {
			setIsLoggedIn(false);
			setIsVerified(false);
			setIsParent(false);
			setUserId(null);
			setTimeLimit(null);
		}

		if (savedTimeLimit !== null && savedTimeLimit > 0) {
			const timer = setInterval(() => {
				setTimeLimit((prev) => {
					if (prev !== null && prev > 0) {
						localStorage.setItem("timeLimit", String(prev - 1));
						return prev - 1;
					} else {
						clearInterval(timer);
						logout(); // Automatically logout when time expires
						return null;
					}
				});
			}, 60000); // Decrease time limit every minute

			return () => clearInterval(timer); // Cleanup timer on component unmount
		}
	}, []);

	const login = (token: string, parentStatus: boolean, timeLimit?: number) => {
		localStorage.setItem("token", token);
		if (timeLimit !== undefined) {
			localStorage.setItem("timeLimit", String(timeLimit));
			setTimeLimit(timeLimit);
		} else {
			const savedTimeLimit = localStorage.getItem("timeLimit");
			if (savedTimeLimit) {
				setTimeLimit(Number(savedTimeLimit));
			}
		}

		try {
			const decodedToken = JSON.parse(atob(token.split(".")[1]));
			setIsLoggedIn(true);
			setIsVerified(decodedToken.isVerified || false);
			setIsParent(parentStatus);
			setUserId(decodedToken.userId || null);
		} catch (error) {
			console.error("Failed to decode token during login:", error);
			setIsVerified(false);
			setUserId(null);
		}

		router.push(parentStatus ? "/parent/profile" : "/");
	};

	const logout = () => {
		const currentTimeLimit = localStorage.getItem("timeLimit");
		localStorage.removeItem("token");
		setIsLoggedIn(false);
		setIsVerified(false);
		setIsParent(false);
		setUserId(null);
		if (currentTimeLimit) {
			localStorage.setItem("timeLimit", currentTimeLimit);
			setTimeLimit(Number(currentTimeLimit));
		}
		router.push("/auth");
	};

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn,
				isVerified,
				isParent,
				userId,
				timeLimit,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// `useAuth` hook
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

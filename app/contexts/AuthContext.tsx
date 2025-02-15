"use client";

import {
	createContext,
	useState,
	useEffect,
	useContext,
	type ReactNode,
	useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type { Child } from "@/types";

type AuthContextType = {
	isLoggedIn: boolean;
	isVerified: boolean;
	isParent: boolean;
	isAdmin: boolean;
	isChild: boolean;
	userId: string | null;
	timeLimit: number | null;
	token: string | null;
	login: (token: string, parentStatus: boolean, timeLimit?: number) => void;
	logout: () => void;
	child: null | Child;
	refetchChild: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
	isLoggedIn: false,
	isVerified: false,
	isParent: false,
	isAdmin: false,
	isChild: false,
	userId: null,
	timeLimit: null,
	token: null,
	login: () => {},
	logout: () => {},
	child: null,
	refetchChild: null as never,
});

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [role, setRole] = useState<"admin" | "parent" | "child" | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [timeLimit, setTimeLimit] = useState<number | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [child, setChild] = useState<Child | null>(null);
	const router = useRouter();

	const logout = useCallback(() => {
		const currentTimeLimit = localStorage.getItem("timeLimit");
		localStorage.removeItem("token");
		setIsLoggedIn(false);
		setIsVerified(false);
		setRole(null);
		setUserId(null);
		setToken(null);
		if (currentTimeLimit) {
			localStorage.setItem("timeLimit", currentTimeLimit);
			setTimeLimit(Number(currentTimeLimit));
		}
		router.push("/");
	}, [router]);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const savedTimeLimit = Number(localStorage.getItem("timeLimit")) || null;

		if (storedToken) {
			try {
				const decodedToken = JSON.parse(atob(storedToken.split(".")[1]));
				setIsLoggedIn(true);
				setIsVerified(decodedToken.isVerified || false);
				setRole(decodedToken.role || null);
				setUserId(decodedToken.userId || null);
				setTimeLimit(savedTimeLimit);
				setToken(storedToken);
			} catch (error) {
				console.error("Failed to decode token:", error);
				logout();
			}
		} else {
			setIsLoggedIn(false);
			setIsVerified(false);
			setRole(null);
			setUserId(null);
			setTimeLimit(null);
			setToken(null);
		}

		if (savedTimeLimit !== null && savedTimeLimit > 0) {
			const timer = setInterval(() => {
				setTimeLimit((prev) => {
					if (prev !== null && prev > 0) {
						localStorage.setItem("timeLimit", String(prev - 1));
						return prev - 1;
					}
					clearInterval(timer);
					logout();
					return null;
				});
			}, 60000);

			return () => clearInterval(timer);
		}
	}, [logout]);

	const login = (
		newToken: string,
		parentStatus: boolean,
		timeLimit?: number,
	) => {
		localStorage.setItem("token", newToken);
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
			const decodedToken = JSON.parse(atob(newToken.split(".")[1]));
			setIsLoggedIn(true);
			setIsVerified(decodedToken.isVerified || false);
			setRole(decodedToken.role || null);
			setUserId(decodedToken.userId || null);
			setToken(newToken);
		} catch (error) {
			console.error("Failed to decode token during login:", error);
			setIsVerified(false);
			setUserId(null);
			setToken(null);
		}
	};

	const fetchChildProfile = useCallback(async () => {
		try {
			const response = await fetch("/api/auth/child", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			if (response.ok) {
				setChild(data.child || null);
			} else {
				throw new Error("Failed to get profile information");
			}
		} catch (e: unknown) {
			console.error(e);
		}
	}, [token]);
	useEffect(() => {
		if (role !== "child") return;
		fetchChildProfile();
	}, [role, fetchChildProfile]);

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn,
				isVerified,
				isParent: role === "parent",
				isAdmin: role === "admin",
				isChild: role === "child",
				userId,
				timeLimit,
				token,
				login,
				logout,
				child,
				refetchChild: fetchChildProfile,
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

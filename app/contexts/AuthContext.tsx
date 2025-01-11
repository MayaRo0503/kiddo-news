"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Define the context
export const AuthContext = createContext<{
  isLoggedIn: boolean;
  isVerified: boolean; // Add isVerified to the context
  timeLimit: number | null;
  login: (token: string, timeLimit?: number) => void;
  logout: () => void;
} | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Track verification status
  const [timeLimit, setTimeLimit] = useState<number | null>(null); // Track remaining time
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const savedTimeLimit =
      typeof window !== "undefined"
        ? Number(localStorage.getItem("timeLimit")) || null
        : null;

    setIsLoggedIn(!!token);
    setTimeLimit(savedTimeLimit);

    // Decode token to retrieve isVerified status
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        setIsVerified(decodedToken.isVerified || false);
      } catch (error) {
        console.error("Failed to decode token:", error);
        setIsVerified(false);
      }
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

  const login = (token: string, timeLimit?: number) => {
    localStorage.setItem("token", token);
    if (timeLimit !== undefined) {
      localStorage.setItem("timeLimit", String(timeLimit));
      setTimeLimit(timeLimit);
    }

    // Decode token to retrieve isVerified status
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      setIsVerified(decodedToken.isVerified || false);
    } catch (error) {
      console.error("Failed to decode token during login:", error);
      setIsVerified(false);
    }

    setIsLoggedIn(true);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("timeLimit");
    setIsLoggedIn(false);
    setIsVerified(false); // Reset verification status
    setTimeLimit(null);
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isVerified, timeLimit, login, logout }}
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

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
  login: (token: string) => void;
  logout: () => void;
} | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/auth");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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

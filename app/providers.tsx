"use client";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/use-toast";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<AuthProvider>
			<ToastProvider>{children}</ToastProvider>
		</AuthProvider>
	);
}

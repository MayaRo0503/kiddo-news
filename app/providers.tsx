"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/use-toast";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

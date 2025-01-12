"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  addToast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (props: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, props]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.slice(1));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t, i) => (
          <div
            key={i}
            className={`rounded-md p-4 ${
              t.variant === "destructive" ? "bg-red-500" : "bg-gray-800"
            } text-white shadow-lg`}
          >
            <h3 className="font-bold">{t.title}</h3>
            {t.description && <p className="text-sm">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

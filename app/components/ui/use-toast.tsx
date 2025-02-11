"use client";

import type * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";

type ToastProps = {
	title: string;
	description?: string;
	variant?: "default" | "destructive";
};

type ToastContextType = {
	toast: (props: ToastProps) => void;
	dismiss: (toastId?: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

	const toast = useCallback((props: ToastProps) => {
		const id = Math.random().toString(36).substr(2, 9);
		setToasts((prevToasts) => [...prevToasts, { ...props, id }]);
		setTimeout(() => {
			setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
		}, 5000);
	}, []);

	const dismiss = useCallback((toastId?: string) => {
		setToasts((prevToasts) =>
			toastId
				? prevToasts.filter((t) => t.id !== toastId)
				: prevToasts.slice(1),
		);
	}, []);

	return (
		<ToastContext.Provider value={{ toast, dismiss }}>
			{children}
			<div className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-2">
				{toasts.map((t) => (
					<div
						key={t.id}
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

import { useEffect, useState } from "react";
import { useAuth } from "app/contexts/AuthContext";

interface TimeManagementState {
	timeRemaining: number | null;
	isLoading: boolean;
	error: string | null;
}

export function useTimeManagement() {
	const [state, setState] = useState<TimeManagementState>({
		timeRemaining: null,
		isLoading: true,
		error: null,
	});
	const { token, isChild } = useAuth();

	useEffect(() => {
		if (!isChild) return;

		const updateTimeSpent = async () => {
			if (!token) return;
			try {
				const response = await fetch("/api/auth/child/track-time", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error("Failed to update time spent");
				}

				const data = await response.json();

				setState((prev) => ({
					...prev,
					timeRemaining: data.remainingTime,
					isLoading: false,
				}));
			} catch (error) {
				console.error(error);
				setState((prev) => ({
					...prev,
					error: "Failed to track time",
					isLoading: false,
				}));
			}
		};

		updateTimeSpent();

		const timer = setInterval(updateTimeSpent, 60000);

		return () => {
			clearInterval(timer);
			const endSession = async () => {
				try {
					await fetch("/api/auth/child/track-time", {
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
				} catch (error) {
					console.error("Error ending session:", error);
				}
			};

			endSession();
		};
	}, [isChild, token]);

	return {
		...state,
		timeIsUp: state.timeRemaining !== null && state.timeRemaining <= 0,
	};
}

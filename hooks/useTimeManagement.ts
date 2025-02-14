import { useEffect, useState } from "react";
import { useAuth } from "app/contexts/AuthContext";

interface TimeManagementState {
  timeRemaining: number | null;
  canAccessArticles: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useTimeManagement() {
  const [state, setState] = useState<TimeManagementState>({
    timeRemaining: null,
    canAccessArticles: true,
    isLoading: true,
    error: null,
  });

  const { token, isChild } = useAuth();

  useEffect(() => {
    if (!isChild) return;

    const fetchTimeData = async () => {
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

        setState({
          timeRemaining: data.remainingTime,
          canAccessArticles: data.remainingTime > 0,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error tracking time:", error);
        setState({
          timeRemaining: null,
          canAccessArticles: false,
          isLoading: false,
          error: "Failed to track time",
        });
      }
    };

    fetchTimeData();

    // Fetch data every minute
    const timer = setInterval(fetchTimeData, 60000);

    return () => {
      clearInterval(timer);
    };
  }, [isChild, token]);

  return {
    ...state,
    timeIsUp: !state.canAccessArticles,
  };
}

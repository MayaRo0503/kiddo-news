import { useTimeManagement } from "../../hooks/useTimeManagement";
import TimeUpDialog from "./ui/time-up-dialog";

interface TimeUpWrapperProps {
	children: React.ReactNode;
}

export function TimeUpWrapper({ children }: TimeUpWrapperProps) {
	const { isLoading, timeIsUp } = useTimeManagement();

	if (isLoading) {
		return null;
	}

	return (
		<>
			{children}
			<TimeUpDialog open={timeIsUp} />
		</>
	);
}

import { Loader2Icon } from "lucide-react";

export const Spinner = () => {
	return (
		<div className="grid place-items-center content-center h-[calc(100vh_-_4rem)] h-16 w-full hue-rotate">
			<Loader2Icon className="animate-spin text-green-300 size-16 stroke-1" />
			<span className="text-green-400 p-2">
				Loading
				<span className="animate-pulse">.</span>
				<span className="animate-pulse delay-75">.</span>
				<span className="animate-pulse delay-150">.</span>
			</span>
		</div>
	);
};

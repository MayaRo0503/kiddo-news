import { Button, type ButtonProps } from "./ui/button";
import { LoaderCircle } from "lucide-react";

interface Props extends ButtonProps {
	loading: boolean;
}

export const ActionButton = ({ loading, ...props }: Props) => {
	return (
		<span className="relative">
			<Button {...props} type="button" disabled={loading}>
				{loading ? <LoaderCircle className="animate-rotate" /> : props.children}
			</Button>
		</span>
	);
};

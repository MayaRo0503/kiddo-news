import { Slot, type SlotProps } from "@radix-ui/react-slot";

interface Props extends SlotProps {
	asChild?: boolean;
	handleBlur: (newValue: string) => void;
}

export const ContentEditable = ({
	asChild = true,
	handleBlur,
	...props
}: Props) => {
	const Comp = asChild ? Slot : "span";
	return (
		<Comp
			onBlur={(e) => {
				const newValue = e.target.textContent as string;
				handleBlur(newValue);
			}}
			contentEditable
			suppressContentEditableWarning
			{...props}
		/>
	);
};

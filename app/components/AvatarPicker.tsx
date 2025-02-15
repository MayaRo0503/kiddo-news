import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useChildProfile } from "@/hooks/useChildProfile";
import { AVATAR_ICON_MAP } from "@/lib/avatarIconMap";

interface AvatarPickerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (icon: string, color: string) => void;
	currentIcon: string;
	currentColor: string;
}

const AVATAR_COLORS = [
	"#FF6B6B",
	"#4ECDC4",
	"#45B7D1",
	"#96CEB4",
	"#FFEEAD",
	"#D4A5A5",
	"#9B59B6",
	"#3498DB",
	"#FF9F43",
	"#A8E6CF",
	"#FFD3B6",
	"#FF8B94",
];

export function AvatarPicker({ open, onOpenChange }: AvatarPickerProps) {
	const { childAvatar, child, updateChildProfile } = useChildProfile();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Choose Your Avatar</DialogTitle>
				</DialogHeader>
				<div className="space-y-6 py-4">
					<div>
						<label className="text-sm font-medium mb-2 block">Preview</label>
						<div className="flex justify-center">
							<div
								className="text-4xl w-16 h-16 rounded-full flex items-center justify-center transition-colors"
								style={{ backgroundColor: child?.favoriteColor }}
							>
								{childAvatar}
							</div>
						</div>
					</div>

					<div>
						<label className="text-sm font-medium mb-2 block">
							Choose Icon
						</label>
						<div className="grid grid-cols-8 gap-2">
							{Object.entries(AVATAR_ICON_MAP).map(([name, avatar]) => (
								<Button
									key={name}
									variant={child?.avatar === name ? "default" : "outline"}
									className="text-2xl p-2 h-auto"
									onClick={() => updateChildProfile({ avatar: name })}
								>
									{avatar}
								</Button>
							))}
						</div>
					</div>

					<div>
						<label className="text-sm font-medium mb-2 block">
							Choose Color
						</label>
						<div className="grid grid-cols-6 gap-2">
							{AVATAR_COLORS.map((color) => (
								<Button
									key={color}
									variant="outline"
									className="w-full h-8 rounded-full transition-colors"
									style={{ backgroundColor: color }}
									onClick={() => updateChildProfile({ favoriteColor: color })}
								/>
							))}
						</div>
					</div>

					{/* <div className="flex justify-end">
						<Button onClick={() => onOpenChange(false)}>Save Avatar</Button>
					</div> */}
				</div>
			</DialogContent>
		</Dialog>
	);
}

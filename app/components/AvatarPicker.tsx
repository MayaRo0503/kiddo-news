import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (icon: string, color: string) => void;
  currentIcon: string;
  currentColor: string;
}

const AVATAR_ICONS = [
  "🦁",
  "🐯",
  "🐼",
  "🐨",
  "🐸",
  "🦊",
  "🦄",
  "🐬",
  "🦋",
  "🌟",
  "🌈",
  "🚀",
  "🎨",
  "🎮",
  "📚",
  "🎵",
];

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

export function AvatarPicker({
  open,
  onOpenChange,
  onSelect,
  currentIcon,
  currentColor,
}: AvatarPickerProps) {
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);
  const [selectedColor, setSelectedColor] = useState(currentColor);

  const handleSave = () => {
    onSelect(selectedIcon, selectedColor);
    onOpenChange(false);
  };

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
                style={{ backgroundColor: selectedColor }}
              >
                {selectedIcon}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Choose Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_ICONS.map((icon) => (
                <Button
                  key={icon}
                  variant={selectedIcon === icon ? "default" : "outline"}
                  className="text-2xl p-2 h-auto"
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
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
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Avatar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

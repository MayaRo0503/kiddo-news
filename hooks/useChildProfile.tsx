import { useToast } from "@/app/components/ui/use-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import { AVATAR_ICON_MAP } from "@/lib/avatarIconMap";
import type { Child } from "@/types";
import { useCallback, useEffect } from "react";

export const useChildProfile = () => {
	const { token, child, refetchChild } = useAuth();
	const { toast } = useToast();

	const updateChildProfile = useCallback(
		async (options: Partial<Pick<Child, "favoriteColor" | "avatar">> = {}) => {
			try {
				const res = await fetch("/api/auth/child", {
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(options),
				});
				if (res.ok) {
					toast({
						title: "Avatar Updated!",
						description: "Your new avatar has been saved successfully.",
					});
					refetchChild();
				} else {
					toast({
						title: res.statusText || "Avatar could not be updated right now",
					});
				}
			} catch (e) {
				console.error(e);
				toast({
					title: "Avatar could not be updated right now",
				});
			}
		},
		[toast, token, refetchChild],
	);
	return {
		updateChildProfile,
		child,
		childAvatar: child?.avatar
			? AVATAR_ICON_MAP[child.avatar as keyof typeof AVATAR_ICON_MAP]
			: null,
	};
};

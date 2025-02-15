"use client";

import { useState } from "react";
import { User, Clock, Heart, Bookmark } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/use-toast";
import { BirthdayCard } from "../../components/BirthdayCard";
import Link from "next/link";
import AnimatedHourglass from "../../components/AnimatedHourglass";
import { Spinner } from "@/app/components/Spinner";
import { AVATAR_ICON_MAP } from "@/lib/avatarIconMap";
import { useChildProfile } from "@/hooks/useChildProfile";
import type { IArticle } from "@/types";

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

const ChildProfile = () => {
	const [accessCode, setAccessCode] = useState("");
	const [isEditingAccessCode, setIsEditingAccessCode] = useState(false);
	const { toast } = useToast();
	const { child, updateChildProfile } = useChildProfile();
	const likedArticles = (child?.likedArticles as unknown as IArticle[]) || [];
	const savedArticles = (child?.savedArticles as unknown as IArticle[]) || [];

	const handleUpdateAccessCode = async () => {
		const response = await fetch("/api/auth/child/access_code", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({ access_code: accessCode }),
		});
		const data = await response.json();
		if (response.ok) {
			toast({
				title: "Access Code Updated!",
				description: "Your access code has been saved successfully.",
			});
			setIsEditingAccessCode(false);
		} else {
			toast({
				title: "Error updating Access Code",
				description: data.error || "Something went wrong.",
			});
		}
	};

	if (!child) return <Spinner />;

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 overflow-y-auto">
			<main className="container mx-auto py-6 space-y-6">
				<div className="flex gap-6 max-md:flex-col max-md:items-center">
					<Card className="w-full overflow-hidden group hover:shadow-lg transition-all duration-300">
						<CardHeader className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
							<CardTitle className="flex items-center gap-2 w-full">
								<User className="w-5 h-5" />
								My Profile
							</CardTitle>
						</CardHeader>
						<CardContent className="p-4 flex justify-around">
							<div className="flex items-center gap-4">
								<div
									className="text-4xl w-16 h-16 rounded-full flex items-center justify-center"
									style={{ backgroundColor: child?.favoriteColor }}
								>
									{child &&
										AVATAR_ICON_MAP?.[
											child.avatar as keyof typeof AVATAR_ICON_MAP
										]}
								</div>
								<div>
									<h2 className="text-2xl font-bold">{child.name}</h2>
									<p className="text-muted-foreground">@{child.username}</p>
								</div>
							</div>

							<div className="space-y-4 pt-4">
								<div>
									<label className="text-sm font-medium mb-2 block">
										Choose Your Icon
									</label>
									<div className="grid grid-cols-8 gap-2">
										{Object.entries(AVATAR_ICON_MAP).map(([name, avatar]) => (
											<Button
												key={name}
												variant={
													child.avatar === avatar ? "default" : "outline"
												}
												className="text-3xl p-2 h-auto transition-transform duration-200 hover:scale-105"
												onClick={() => updateChildProfile({ avatar: name })}
											>
												{avatar}
											</Button>
										))}
									</div>
								</div>

								<div>
									<label className="text-sm font-medium mb-2 block">
										Choose Your Color
									</label>
									<div className="grid grid-cols-6 gap-2">
										{AVATAR_COLORS.map((color) => (
											<Button
												key={color}
												variant="outline"
												className="w-full h-8 rounded-full transition-transform duration-200 hover:scale-105"
												style={{ backgroundColor: color }}
												onClick={() =>
													updateChildProfile({ favoriteColor: color })
												}
											/>
										))}
									</div>
								</div>

								{/* <Button className="w-full mt-4">Save My Avatar</Button> */}

								{/* Updated Access Code Section */}
								<div className="mt-6">
									<label className="text-sm font-medium mb-2 block">
										Access Code
									</label>
									<input
										type="text"
										value={accessCode}
										onChange={(e) => setAccessCode(e.target.value)}
										placeholder="Enter your new access code"
										disabled={!isEditingAccessCode}
										className="w-full p-2 border rounded bg-white"
									/>
									{isEditingAccessCode ? (
										<div className="flex gap-2 mt-2">
											<Button
												className="w-full"
												onClick={handleUpdateAccessCode}
											>
												Update Access Code
											</Button>
											<Button
												variant="outline"
												className="w-full"
												onClick={() => {
													setIsEditingAccessCode(false);
													// Reset to original value if canceled
													setAccessCode(child.access_code);
												}}
											>
												Cancel
											</Button>
										</div>
									) : (
										<Button
											className="w-full mt-2"
											onClick={() => setIsEditingAccessCode(true)}
										>
											Edit Access Code
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Birthday card now receives a Date that is formatted inside the component */}
					<div className="flex md:flex-col gap-6 items-center">
						<Card className="w-64 h-64 max-md:size-full overflow-hidden group hover:shadow-lg transition-all duration-100 rounded-full">
							<CardContent className="p-8 flex flex-col items-center justify-center">
								<CardTitle className="flex items-center gap-2 mb-4">
									<Clock className="w-5 h-5" />
									Time Left Today
								</CardTitle>
								<AnimatedHourglass
									remainingTime={child.remainingTime}
									totalTime={child.timeLimit}
								/>

								<p className="text-muted-foreground mt-4">minutes</p>
							</CardContent>
						</Card>
						<BirthdayCard
							dateOfBirth={child.birthDate}
							firstName={child.name}
						/>
					</div>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					{/* Articles I Love */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Heart className="w-5 h-5 text-red-500" />
								<span className="text-xl font-bold text-red-600">
									Articles I Love
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-4">
							{likedArticles.length === 0 ? (
								<p className="text-muted-foreground text-center">
									No favorite articles yet! Start exploring and like the ones
									you enjoy.
								</p>
							) : (
								// Use a grid layout for a solid list
								<ul className="grid grid-cols-1 gap-4">
									{likedArticles.map((article) => (
										<li
											key={article._id}
											className="p-4 border border-solid border-indigo-200 rounded-lg shadow-md bg-gradient-to-r from-pink-100 to-purple-100 transition-transform hover:scale-105"
										>
											<Link
												href={`/articles/${article._id}`}
												className="block text-1xl font-bold text-indigo-800 hover:text-indigo-900 transition-colors duration-300"
											>
												{article.title}
											</Link>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>

					{/* Saved For Later */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bookmark className="w-5 h-5 text-yellow-500" />
								<span className="text-xl font-bold text-yellow-600">
									Saved For Later
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-4">
							{savedArticles.length === 0 ? (
								<p className="text-muted-foreground text-center">
									No saved articles yet! Bookmark articles to read them later.
								</p>
							) : (
								<ul className="grid grid-cols-1 gap-4">
									{savedArticles.map((article) => (
										<li
											key={article._id}
											className="p-4 border border-solid border-green-200 rounded-lg shadow-md bg-gradient-to-r from-green-100 to-blue-100 transition-transform hover:scale-105"
										>
											<Link
												href={`/articles/${article._id}`}
												className="block text-1xl font-bold text-green-800 hover:text-green-900 transition-colors duration-300"
											>
												{article.title}
											</Link>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
};

export default ChildProfile;

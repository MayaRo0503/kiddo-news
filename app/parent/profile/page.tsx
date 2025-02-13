"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "app/components/ui/card";
import {
	Clock,
	BookOpen,
	Heart,
	Bookmark,
	Calendar,
	User,
	ArrowUp,
	SquareAsterisk,
} from "lucide-react";
import Link from "next/link";
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import { useToast } from "app/components/ui/use-toast";
import { Spinner } from "@/app/components/Spinner";

interface ChildStats {
	savedArticles: Array<{
		_id: string;
		title: string;
	}>;
	likedArticles: Array<{
		_id: string;
		title: string;
	}>;
	timeSpent: number;
	lastLogin: string;
	username: string;
	timeLimit: number;
	access_code: string;
}

interface ParentProfile {
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	child: {
		username: string;
		timeLimit: number;
		acces_code: string;
	};
}

export default function ParentProfilePage() {
	const [childStats, setChildStats] = useState<ChildStats | null>(null);
	const [parentProfile, setParentProfile] = useState<ParentProfile | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const { isLoggedIn, isParent, userId } = useAuth();
	const router = useRouter();
	const [showScrollButton, setShowScrollButton] = useState(false);
	const pageRef = useRef<HTMLDivElement>(null);
	const [newTimeLimit, setNewTimeLimit] = useState<number | "">("");
	const { toast } = useToast();

	useEffect(() => {
		const fetchData = async () => {
			if (!isLoggedIn || !isParent || !userId) {
				router.push("/");
				return;
			}

			try {
				const token = localStorage.getItem("token");
				if (!token) {
					throw new Error("No authentication token found");
				}

				// Fetch parent profile
				const profileRes = await fetch(`/api/auth/parent/${userId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!profileRes.ok) {
					throw new Error(`Failed to fetch profile: ${profileRes.status}`);
				}

				const profileData = await profileRes.json();
				setParentProfile(profileData.parent);

				// Fetch child statistics
				const statsRes = await fetch(`/api/auth/parent/${userId}/child-stats`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!statsRes.ok) {
					throw new Error(`Failed to fetch child stats: ${statsRes.status}`);
				}

				const statsData = await statsRes.json();
				setChildStats(statsData.stats);
				setNewTimeLimit(statsData.stats.timeLimit);
			} catch (error) {
				console.error("Error fetching data:", error);
				router.push("/");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [isLoggedIn, isParent, userId, router]);

	useEffect(() => {
		const handleScroll = () => {
			if (pageRef.current) {
				setShowScrollButton(pageRef.current.scrollTop > 300);
			}
		};

		const currentPageRef = pageRef.current;
		if (currentPageRef) {
			currentPageRef.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (currentPageRef) {
				currentPageRef.removeEventListener("scroll", handleScroll);
			}
		};
	}, []);

	const scrollToTop = () => {
		pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleUpdateTimeLimit = async () => {
		if (
			newTimeLimit === "" ||
			Number.isNaN(Number(newTimeLimit)) ||
			Number(newTimeLimit) < 0
		) {
			toast({
				title: "Invalid Time Limit",
				description: "Please enter a valid positive number for the time limit.",
				variant: "destructive",
			});
			return;
		}

		try {
			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("No authentication token found");
			}

			const response = await fetch(
				`/api/auth/parent/${userId}/update-time-limit`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ timeLimit: Number(newTimeLimit) }),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to update time limit");
			}

			const data = await response.json();
			setChildStats((prevStats) =>
				prevStats ? { ...prevStats, timeLimit: data.newTimeLimit } : null,
			);
			toast({
				title: "Time Limit Updated",
				description: `The new time limit has been set to ${data.newTimeLimit} minutes.`,
			});
		} catch (error) {
			console.error("Error updating time limit:", error);
			toast({
				title: "Error",
				description: "Failed to update time limit. Please try again.",
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return <Spinner />;
	}

	if (!parentProfile || !childStats) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
				<div className="text-center text-red-500">
					Error loading profile information
				</div>
			</div>
		);
	}

	// Helper function for consistent date formatting
	const formatDate = (dateString: string) => {
		if (!dateString) return "Never";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8 overflow-hidden">
			<style jsx global>{`
        /* Custom scrollbar styles */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.5) rgba(243, 232, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 232, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
          border: 2px solid rgba(243, 232, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(139, 92, 246, 0.7);
        }
      `}</style>
			<div
				ref={pageRef}
				className="h-full overflow-y-auto pr-4 custom-scrollbar"
				aria-label="Parent profile information"
			>
				<div className="max-w-7xl mx-auto space-y-8 pb-16">
					{/* Parent Profile Section */}
					<Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
						<CardHeader className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-t-lg">
							<h2 className="text-2xl font-bold text-purple-800">
								Parent Dashboard
							</h2>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<p className="text-gray-600">Name</p>
									<p className="text-lg font-semibold text-purple-900">
										{parentProfile.firstName} {parentProfile.lastName}
									</p>
								</div>
								<div className="space-y-2">
									<p className="text-gray-600">Email</p>
									<p className="text-lg font-semibold text-purple-900">
										{parentProfile.email}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Child Statistics Section */}
					<Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
						<CardHeader className="bg-gradient-to-r from-blue-200 to-green-200 rounded-t-lg">
							<h2 className="text-2xl font-bold text-purple-800">
								Child Activity Dashboard
							</h2>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								{/* Username Card */}
								<Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
									<CardContent className="p-6">
										<div className="flex items-center space-x-4">
											<User className="h-8 w-8 text-purple-500" />
											<div>
												<p className="text-sm text-gray-500">Username</p>
												<p className="text-lg font-bold text-purple-700">
													{childStats.username}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Time Spent Card */}
								<Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
									<CardContent className="p-6">
										<div className="flex items-center space-x-4">
											<Clock className="h-8 w-8 text-blue-500" />
											<div>
												<p className="text-sm text-gray-500">Time Spent</p>
												<p className="text-lg font-bold text-blue-700">
													{childStats.timeSpent} minutes
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Last Login Card */}
								<Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
									<CardContent className="p-6">
										<div className="flex items-center space-x-4">
											<Calendar className="h-8 w-8 text-green-500" />
											<div>
												<p className="text-sm text-gray-500">Last Login</p>
												<p className="text-lg font-bold text-green-700">
													{formatDate(childStats.lastLogin)}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Articles Stats Card */}
								<Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
									<CardContent className="p-6">
										<div className="flex items-center space-x-4">
											<BookOpen className="h-8 w-8 text-yellow-500" />
											<div>
												<p className="text-sm text-gray-500">
													Total Interactions
												</p>
												<p className="text-lg font-bold text-yellow-700">
													{childStats.savedArticles.length +
														childStats.likedArticles.length}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* access code for child Card */}
							<Card className="bg-white shadow-md hover:shadow-lg transition-all duration-300">
								<CardContent className="p-6">
									<div className="flex items-center space-x-4">
										<SquareAsterisk className="h-8 w-8 text-red-500" />
										<div>
											<p className="text-sm text-gray-500">Access code</p>
											<p className="text-lg font-bold text-blue-700">
												{childStats.access_code}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Time Limit Update Section */}
							<Card className="mt-8 bg-white shadow-md hover:shadow-lg transition-all duration-300">
								<CardHeader>
									<h3 className="text-xl font-bold text-purple-800">
										Update Time Limit
									</h3>
								</CardHeader>
								<CardContent>
									<div className="flex items-center space-x-4">
										<Input
											type="number"
											value={newTimeLimit}
											onChange={(e) =>
												setNewTimeLimit(
													e.target.value === "" ? "" : Number(e.target.value),
												)
											}
											placeholder="Enter new time limit (minutes)"
											className="w-64"
										/>
										<Button
											onClick={handleUpdateTimeLimit}
											className="bg-purple-500 hover:bg-purple-600 text-white"
										>
											Update Time Limit
										</Button>
									</div>
									<p className="mt-2 text-sm text-gray-600">
										Current time limit: {childStats.timeLimit} minutes
									</p>
								</CardContent>
							</Card>

							{/* Detailed Article Lists */}
							<div className="mt-8 grid md:grid-cols-2 gap-8">
								{/* Liked Articles */}
								<Card className="bg-white/90 shadow-md hover:shadow-lg transition-all duration-300">
									<CardHeader>
										<h3 className="flex items-center text-xl font-bold text-pink-600">
											<Heart className="h-5 w-5 mr-2" />
											Liked Articles
										</h3>
									</CardHeader>
									<CardContent>
										<div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
											{childStats.likedArticles.length > 0 ? (
												childStats.likedArticles.map((article) => (
													<Link
														href={`/articles/${article._id}`}
														key={article._id}
													>
														<div className="p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer">
															<p className="font-medium text-pink-800">
																{article.title}
															</p>
														</div>
													</Link>
												))
											) : (
												<p className="text-gray-500">No liked articles yet.</p>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Saved Articles */}
								<Card className="bg-white/90 shadow-md hover:shadow-lg transition-all duration-300">
									<CardHeader>
										<h3 className="flex items-center text-xl font-bold text-blue-600">
											<Bookmark className="h-5 w-5 mr-2" />
											Saved Articles
										</h3>
									</CardHeader>
									<CardContent>
										<div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
											{childStats.savedArticles.length > 0 ? (
												childStats.savedArticles.map((article) => (
													<Link
														href={`/articles/${article._id}`}
														key={article._id}
													>
														<div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
															<p className="font-medium text-blue-800">
																{article.title}
															</p>
														</div>
													</Link>
												))
											) : (
												<p className="text-gray-500">No saved articles yet.</p>
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			{showScrollButton && (
				<Button
					className="fixed bottom-8 right-8 rounded-full p-3 bg-purple-500 hover:bg-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-110"
					onClick={scrollToTop}
					aria-label="Scroll to top"
				>
					<ArrowUp className="h-6 w-6" />
				</Button>
			)}
		</div>
	);
}

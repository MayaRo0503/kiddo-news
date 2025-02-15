"use client";

import { useState } from "react";
import type { Article } from "@/types/Article";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { ActionButton } from "./ActionButton";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { ContentEditable } from "./ui/content-editable";
import { useAuth } from "../contexts/AuthContext";

interface ArticleListProps {
	articles: Article[];
	onArticleAction: (
		articleId: string,
		action: "approve" | "reject" | "gptCorrection",
		correctionNote?: string,
		targetAgeRange?: number,
	) => void;
	refetchArticle: (articleId: string) => Promise<void>;
}

export default function ArticleList({
	articles,
	onArticleAction,
	refetchArticle,
}: ArticleListProps) {
	const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
	const [correctionNote, setCorrectionNote] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [targetAgeRange, setTargetAgeRange] = useState<number | null>(null);
	const handleGPTCorrection = (article: Article) => {
		setSelectedArticle(article);
		setIsDialogOpen(true);
	};
	const { toast } = useToast();
	const { token } = useAuth();

	// const handleSendCorrection = () => {
	//   if (correctionNote.length < 10) {
	//     toast({
	//       title: "Please enter a correction note",
	//       variant: "destructive",
	//     });
	//     return;
	//   }
	//   if (!targetAgeRange || !Number.isInteger(targetAgeRange)) {
	//     toast({
	//       title: "Please enter a target age range",
	//       variant: "destructive",
	//     });
	//     return;
	//   }
	//   if (targetAgeRange < 5 || targetAgeRange > 17) {
	//     toast({
	//       title: "Please enter a valid target age range between 5 and 17",
	//       variant: "destructive",
	//     });
	//     return;
	//   }
	//   if (selectedArticle) {
	//     onArticleAction(
	//       selectedArticle._id,
	//       "gptCorrection",
	//       correctionNote,
	//       targetAgeRange
	//     );
	//     setIsDialogOpen(false);
	//     setCorrectionNote("");
	//   }
	// };
	const handleSendCorrection = () => {
		if (correctionNote.length < 10) {
			toast({
				title: "Please enter a correction note",
				variant: "destructive",
			});
			return;
		}

		if (!targetAgeRange || !Number.isInteger(targetAgeRange)) {
			toast({
				title: "Please enter a target age range",
				variant: "destructive",
			});
			return;
		}

		if (targetAgeRange < 5 || targetAgeRange > 17) {
			toast({
				title: "Please enter a valid target age range between 5 and 17",
				variant: "destructive",
			});
			return;
		}

		if (selectedArticle) {
			console.log("Sending correction:", {
				articleId: selectedArticle._id,
				correctionNote,
				targetAgeRange,
			});

			onArticleAction(
				selectedArticle._id,
				"gptCorrection",
				correctionNote, // Ensure this is passed!
				targetAgeRange, // Ensure this is passed!
			);

			setIsDialogOpen(false);
			setCorrectionNote("");
			setTargetAgeRange(null);
		}
	};

	const getSentimentColor = (sentiment: string) => {
		switch (sentiment?.toLowerCase()) {
			case "positive":
				return "bg-green-100 text-green-800";
			case "negative":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusBadge = (status: Article["status"]) => {
		switch (status) {
			case "pending":
				return <Badge variant="secondary">Pending</Badge>;
			case "approved":
				return <Badge variant="default">Approved</Badge>;
			case "rejected":
				return <Badge variant="destructive">Rejected</Badge>;
			case "pending_correction":
				return <Badge variant="outline">Pending Correction</Badge>;
			default:
				return null;
		}
	};

	async function editArticle(
		articleId: string,
		key: "title" | "content",
		newValue: string,
	) {
		try {
			await fetch(`/api/articles/${articleId}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ [key]: newValue }),
			});
		} catch (e) {
			console.error(e);
		} finally {
			refetchArticle(articleId);
		}
	}

	return (
		<div className="space-y-6">
			{articles.map((article) => (
				<div
					key={article._id}
					className="bg-white shadow-md rounded-lg p-6 transition-colors"
				>
					<div className="flex justify-between items-start mb-2">
						<ContentEditable
							handleBlur={(newTitle) =>
								editArticle(article._id, "title", newTitle)
							}
							onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
						>
							<h2 className="text-xl font-semibold">{article.title}</h2>
						</ContentEditable>
						{getStatusBadge(article.status)}
					</div>
					<div className="flex justify-between items-center text-sm text-gray-500 mb-4">
						<span>Author: {article.author}</span>
						<span>
							Published:{" "}
							{new Date(article.publishDate).toLocaleDateString("en-GB")}
						</span>
					</div>
					<ContentEditable
						handleBlur={(newContent) =>
							editArticle(article._id, "content", newContent)
						}
						onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
					>
						<p className="text-gray-600 mb-4 ltr">{article.content}</p>
					</ContentEditable>
					<div className="mb-4">
						<h3 className="text-lg font-semibold mb-2">
							Filtering Information:
						</h3>
						<div className="flex flex-wrap gap-2 mb-2">
							{article.keyPhrases.map((phrase, index) => (
								<Badge key={index} variant="secondary">
									{phrase}
								</Badge>
							))}
						</div>
						<div className="flex items-center gap-4">
							<Badge
								variant="outline"
								className={getSentimentColor(article.sentiment)}
							>
								Sentiment: {article.sentiment}
							</Badge>
							{article.relevance && (
								<span className="text-sm">
									Relevance: {article.relevance.toFixed(2)}
								</span>
							)}
						</div>
					</div>
					<div className="flex space-x-2">
						<ActionButton
							onClick={() => onArticleAction(article._id, "approve")}
							variant="default"
							loading={article.status === "approved"}
						>
							Approve
						</ActionButton>
						<ActionButton
							onClick={() => onArticleAction(article._id, "reject")}
							variant="destructive"
							loading={article.status === "rejected"}
						>
							Reject
						</ActionButton>
						<ActionButton
							onClick={() => handleGPTCorrection(article)}
							variant="outline"
							loading={article.status === "pending_correction"}
						>
							Send for GPT Correction
						</ActionButton>
					</div>
				</div>
			))}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Send for GPT Correction</DialogTitle>
						<DialogDescription>
							Please provide instructions for GPT correction.
						</DialogDescription>
					</DialogHeader>
					<Textarea
						value={correctionNote}
						onChange={(e) => setCorrectionNote(e.target.value)}
						placeholder="Enter correction instructions here..."
						rows={4}
					/>
					<Input
						type="number"
						value={targetAgeRange ?? ""}
						onChange={(e) => setTargetAgeRange(parseInt(e.target.value))}
						placeholder="Enter target age range here..."
					/>
					<DialogFooter>
						<Button onClick={() => setIsDialogOpen(false)} variant="outline">
							Cancel
						</Button>
						<Button onClick={handleSendCorrection} variant="default">
							Send for Correction
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

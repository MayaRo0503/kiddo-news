import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
import { Textarea } from "@/app/components/ui/textarea";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  ArrowUp,
  MessageCircle,
  ArrowDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { ArticleType } from "../page";

interface ArticleProps {
  article: ArticleType;
  isLiked: boolean;
  isSaved: boolean;
  handleLike: () => void;
  handleSave: () => void;
  handleAddComment: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const Article = ({
  article,
  isLiked,
  isSaved,
  ...actions
}: ArticleProps) => {
  const { handleLike, handleSave, handleAddComment } = actions;
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  const router = useRouter();
  const { isChild, isAdmin } = useAuth(); // token is added from context
  // Smooth scrolling functions.
  // const scrollToSection = (elementId: string) => {
  // 	document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth" });
  // };

  // const scrollToBottom = () => {
  // 	window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  // };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButtons(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-b from-purple-100 to-blue-100 min-h-screen p-4">
      <div className="container mx-auto max-w-3xl">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          className="fixed top-4 left-4 z-10 p-2 bg-white/80 hover:bg-white text-purple-700 hover:text-purple-900 rounded-full shadow-md transition-all duration-200 hover:scale-105"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <Card className="mb-6 bg-white rounded-2xl shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-200 to-yellow-200 p-4">
            <h1 className="text-2xl md:text-3xl font-bold text-purple-800 mb-2">
              {article?.title}
            </h1>
            <p className="text-sm text-gray-600">
              By {article?.author} |{" "}
              {article?.publishDate &&
                new Date(article.publishDate).toLocaleDateString("en-GB")}
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4 bg-yellow-50 p-3 rounded-lg">
              <h2 className="text-xl font-bold text-purple-700 mb-2">
                Summary
              </h2>
              <p className="text-base text-gray-700">{article?.gptSummary}</p>
            </div>
            {/* <div className="mb-4">
							<h2 className="text-xl font-bold text-purple-700 mb-2">
								Key Points
							</h2>
							<ul className="list-disc list-inside space-y-1">
								{article?.gptAnalysis.summarySentences.map((sentence) => (
									<li key={sentence} className="text-base text-gray-700">
										{sentence}
									</li>
								))}
							</ul>
						</div> */}
          </CardContent>
          <CardFooter className="flex justify-between p-4 bg-gray-50">
            <Button
              variant="outline"
              className={`flex items-center bg-white hover:bg-pink-50 transition-colors duration-200 ${
                isLiked ? "text-pink-500" : "text-gray-500"
              }`}
              onClick={handleLike}
              disabled={!isChild && !isAdmin}
            >
              <Heart className="mr-2 h-4 w-4" />
              <span className="text-sm text-gray-700">
                {article?.likes} Likes
              </span>
            </Button>
            <Button
              variant="outline"
              className={`flex items-center bg-white hover:bg-yellow-50 transition-colors duration-200 ${
                isSaved ? "text-yellow-500" : "text-gray-500"
              }`}
              onClick={handleSave}
              disabled={!isChild && !isAdmin}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              <span className="text-sm text-gray-700">
                {article?.saves} Saves
              </span>
            </Button>
          </CardFooter>
        </Card>

        {/* Comments Section */}
        <Card
          id="comments-section"
          className="bg-white rounded-2xl shadow-md overflow-hidden mb-6"
        >
          <CardHeader className="bg-gradient-to-r from-blue-200 to-green-200 p-4">
            <h2 className="text-2xl font-bold text-purple-800">Comments</h2>
          </CardHeader>
          <CardContent className="p-4">
            {(isChild || isAdmin) && (
              <form className="mb-4" onSubmit={handleAddComment}>
                <Textarea
                  name="newComment"
                  placeholder="What do you think about this article? Share your thoughts!"
                  className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:ring focus:ring-purple-100 transition-all duration-200 text-base"
                />
                <Button
                  type="submit"
                  className="mt-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                  Post Comment
                </Button>
              </form>
            )}
            <div className="space-y-3">
              {article?.comments && article.comments.length > 0 ? (
                article.comments.map((comment, index) => (
                  <Card
                    key={comment._id || index}
                    className="bg-gray-50 rounded-lg p-3 hover:shadow-sm transition-shadow duration-200"
                  >
                    <CardHeader className="p-0">
                      <h3 className="font-semibold text-base text-purple-700">
                        {comment.author}
                      </h3>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </CardContent>
                    <CardFooter className="p-0">
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          {showScrollButtons && (
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-md p-2 transition-all duration-200 hover:scale-105"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() =>
              document
                .getElementById("comments-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md p-2 transition-all duration-200 hover:scale-105"
            aria-label="Go to comments"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
            className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-md p-2 transition-all duration-200 hover:scale-105"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

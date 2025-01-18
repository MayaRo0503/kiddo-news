import { useState } from "react";
import { Button } from "app/components/ui/button";

interface Article {
  _id: string;
  title: string;
  content: string;
  simplifiedContent?: string;
  isSimplified: boolean;
}

export function ArticleManager({ article }: { article: Article }) {
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedContent, setSimplifiedContent] = useState(
    article.simplifiedContent
  );

  const handleSimplify = async () => {
    setIsSimplifying(true);
    try {
      const response = await fetch("/api/articles/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article._id }),
      });
      const data = await response.json();
      setSimplifiedContent(data.simplifiedContent);
    } catch (error) {
      console.error("Error simplifying article:", error);
    }
    setIsSimplifying(false);
  };

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-2">{article.title}</h2>
      <div className="mb-4">
        <h3 className="font-semibold">Original Content:</h3>
        <p>{article.content}</p>
      </div>
      {simplifiedContent && (
        <div className="mb-4">
          <h3 className="font-semibold">Simplified Content:</h3>
          <p>{simplifiedContent}</p>
        </div>
      )}
      <Button onClick={handleSimplify} disabled={isSimplifying}>
        {isSimplifying ? "Simplifying..." : "Simplify Article"}
      </Button>
    </div>
  );
}

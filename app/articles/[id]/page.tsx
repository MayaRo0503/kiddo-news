import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleActions } from "./article-actions";
import { CommentSection } from "./comment-section";

async function getArticle(id: string) {
  const res = await fetch(`http://localhost:3000/api/articles/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const article = await getArticle(params.id);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: `Article by ${article.author}`,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <article>
      <header>
        <h1>{article.title}</h1>
        <p>By {article.author}</p>
      </header>
      <img src={article.image} alt={article.title} />
      <p>{article.content}</p>
      <ArticleActions
        id={article._id}
        likes={article.likes}
        saves={article.saves}
      />
      <CommentSection articleId={article._id} />
    </article>
  );
}

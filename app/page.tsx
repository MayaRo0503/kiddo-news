import ArticleCarousel from "./components/ArticleCarousel";

const articles = [
  {
    id: 1,
    title: "Exciting Science Discovery",
    category: "Science",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "New Animal Species Found",
    category: "Nature",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Space Exploration Update",
    category: "Space",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Environmental Conservation Efforts",
    category: "Environment",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "Technology Advancements",
    category: "Technology",
    image: "/placeholder.svg?height=200&width=300",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">
        Welcome to Kiddo News
      </h1>
      <ChildView articles={articles} />
    </div>
  );
}

function ChildView({
  articles,
}: {
  articles: Array<{
    id: number;
    title: string;
    category: string;
    image: string;
  }>;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-800">Latest Articles</h2>
      <ArticleCarousel articles={articles} />
    </div>
  );
}

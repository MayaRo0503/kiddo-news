import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sampleArticles = [
  {
    id: 1,
    title: "Friendly Dolphin Helps Lost Swimmer",
    category: "Animals",
    content:
      "In an amazing story from the coast of Australia, a friendly dolphin named Buddy helped a lost swimmer find their way back to shore...",
  },
  {
    id: 2,
    title: "Kids Invent Robot to Clean Beaches",
    category: "Technology",
    content:
      "A group of young inventors from Coastal Elementary School have created a small robot that can clean up litter from beaches...",
  },
  {
    id: 3,
    title: "New Rainbow Fruit Discovered",
    category: "Science",
    content:
      "Scientists in the Amazon rainforest have discovered a new fruit that changes color like a rainbow when it ripens...",
  },
];

export default function SampleArticles() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 p-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Sample Articles
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {sampleArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {article.category}
              </div>
            </CardHeader>
            <CardContent>
              <p>{article.content}</p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Login to read more and interact!
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="flex justify-center">
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

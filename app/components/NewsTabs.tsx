"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const newsCategories = [
  {
    value: "world",
    title: "World News",
    articles: [
      {
        title: "Pandas Learn to Play Soccer",
        description: "In a surprising turn of events, a group of pandas...",
      },
      {
        title: "Kids Invent New Eco-Friendly Toy",
        description: "A group of young inventors from Green Valley...",
      },
    ],
  },
  {
    value: "science",
    title: "Science",
    articles: [
      {
        title: "New Planet Discovered Made of Candy",
        description: "Astronomers at the Sweet Tooth Observatory...",
      },
      {
        title: "Dinosaur Fossils Found in Backyard",
        description: "A family in Colorado made an extraordinary discovery...",
      },
    ],
  },
  {
    value: "technology",
    title: "Technology",
    articles: [
      {
        title: "Robot Helps Kids Learn to Code",
        description: "A new friendly robot is teaching kids how to code...",
      },
      {
        title: "Flying Cars Coming Soon",
        description:
          "Engineers announce successful test flights of new flying cars...",
      },
    ],
  },
];

export function NewsTabs() {
  return (
    <Tabs defaultValue="world" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {newsCategories.map((category) => (
          <TabsTrigger key={category.value} value={category.value}>
            {category.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {newsCategories.map((category) => (
        <TabsContent key={category.value} value={category.value}>
          <Card>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>
                Latest news in {category.title.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.articles.map((article, index) => (
                <div key={index}>
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {article.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

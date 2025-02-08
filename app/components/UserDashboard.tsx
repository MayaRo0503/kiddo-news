"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Article } from "@/components/Article";

interface ArticleData {
  id: string;
  title: string;
  content: string;
  likes: number;
  dislikes: number;
  comments: { id: string; content: string; author: string }[];
}

export function UserDashboard() {
  const [likedArticles, setLikedArticles] = useState<ArticleData[]>([]);
  const [savedArticles, setSavedArticles] = useState<ArticleData[]>([]);
  const [commentedArticles, setCommentedArticles] = useState<ArticleData[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const [likedRes, savedRes, commentedRes, notificationsRes] =
          await Promise.all([
            fetch("/api/user/liked-articles"),
            fetch("/api/user/saved-articles"),
            fetch("/api/user/commented-articles"),
            fetch("/api/user/notifications"),
          ]);

        const [liked, saved, commented, notifs] = await Promise.all([
          likedRes.json(),
          savedRes.json(),
          commentedRes.json(),
          notificationsRes.json(),
        ]);

        setLikedArticles(liked);
        setSavedArticles(saved);
        setCommentedArticles(commented);
        setNotifications(notifs);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Tabs defaultValue="liked">
      <TabsList>
        <TabsTrigger value="liked">Liked Articles</TabsTrigger>
        <TabsTrigger value="saved">Saved Articles</TabsTrigger>
        <TabsTrigger value="commented">Commented Articles</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="liked">
        {likedArticles.map((article) => (
          <Article
            initialLikeStatus={null}
            initialSaveStatus={false}
            key={article.id}
            {...article}
          />
        ))}
      </TabsContent>
      <TabsContent value="saved">
        {savedArticles.map((article) => (
          <Article
            initialLikeStatus={null}
            initialSaveStatus={false}
            key={article.id}
            {...article}
          />
        ))}
      </TabsContent>
      <TabsContent value="commented">
        {commentedArticles.map((article) => (
          <Article
            initialLikeStatus={null}
            initialSaveStatus={false}
            key={article.id}
            {...article}
          />
        ))}
      </TabsContent>
      <TabsContent value="notifications">
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification}</li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}

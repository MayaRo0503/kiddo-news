"use client";

import { useEffect, useState } from "react";

interface Child {
  name: string;
  savedArticles: string[]; // Array of article titles or IDs
  likedArticles: string[]; // Array of article titles or IDs
  timeLimit: number; // Time limit in minutes
}

const ChildProfile = () => {
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    const fetchChildProfile = async () => {
      const response = await fetch("/api/auth/child", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setChild(data.child);
      } else {
        console.error(data.error);
      }
    };

    fetchChildProfile();
  }, []);

  if (!child) return <p>Loading...</p>;

  return (
    <div>
      <h1>Child Profile</h1>
      <p>Name: {child.name}</p>
      <p>Time Limit: {child.timeLimit} minutes</p>
      <h2>Saved Articles</h2>
      {child.savedArticles.length > 0 ? (
        <ul>
          {child.savedArticles.map((article: string) => (
            <li key={article}>{article}</li>
          ))}
        </ul>
      ) : (
        <p>No saved articles</p>
      )}
    </div>
  );
};

export default ChildProfile;

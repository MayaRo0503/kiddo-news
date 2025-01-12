"use client";

import { useEffect, useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Clock, BookOpen, Heart, Bookmark, Calendar, User } from "lucide-react";

interface ChildStats {
  savedArticles: Array<{
    _id: string;
    title: string;
    category: string;
    date: string;
  }>;
  likedArticles: Array<{
    _id: string;
    title: string;
    category: string;
    date: string;
  }>;
  timeSpent: number;
  lastLogin: string;
  username: string;
}

interface ParentProfile {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  child: {
    username: string;
    timeLimit: number;
  };
}

export default function ParentProfilePage() {
  const [childStats, setChildStats] = useState<ChildStats | null>(null);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isParent, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !isParent || !userId) {
        router.push("/auth");
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
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, isParent, userId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
        <div className="text-2xl font-bold text-purple-800">Loading...</div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Parent Profile Section */}
        <Card className="bg-white/80 backdrop-blur-sm">
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
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-200 to-green-200 rounded-t-lg">
            <h2 className="text-2xl font-bold text-purple-800">
              Child Activity Dashboard
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Username Card */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
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
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
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
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
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
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
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

            {/* Detailed Article Lists */}
            <div className="mt-8 grid md:grid-cols-2 gap-8">
              {/* Liked Articles */}
              <Card className="bg-white/90">
                <CardHeader>
                  <h3 className="flex items-center text-xl font-bold text-pink-600">
                    <Heart className="h-5 w-5 mr-2" />
                    Liked Articles
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {childStats.likedArticles.map((article) => (
                      <div
                        key={article._id}
                        className="p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                      >
                        <p className="font-medium text-pink-800">
                          {article.title}
                        </p>
                        <p className="text-sm text-pink-600">
                          {formatDate(article.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Saved Articles */}
              <Card className="bg-white/90">
                <CardHeader>
                  <h3 className="flex items-center text-xl font-bold text-blue-600">
                    <Bookmark className="h-5 w-5 mr-2" />
                    Saved Articles
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {childStats.savedArticles.map((article) => (
                      <div
                        key={article._id}
                        className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <p className="font-medium text-blue-800">
                          {article.title}
                        </p>
                        <p className="text-sm text-blue-600">
                          {formatDate(article.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { User, Key, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChildLoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isAdmin } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/child-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      login(data.token, false);
      setTimeLimit(data.child.timeLimit);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timeLimit !== null) {
      interval = setInterval(() => {
        setTimeLimit((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 60000); // Decrease time limit every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLimit]);

  useEffect(() => {
    if (isLoggedIn) {
      router.push(isAdmin ? "/admin" : "/articles");
    }
  }, [isLoggedIn, router, isAdmin]);

  return (
    // Remove vertical centering and allow vertical scrolling by using overflow-y-scroll
    <div className="min-h-screen bg-gradient-to-r from-blue-300 to-purple-300 px-4 overflow-y-scroll">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
        <div className="bg-gradient-to-r from-yellow-300 to-orange-300 p-6 text-center">
          <h1 className="text-4xl font-bold mb-2 text-purple-800">
            Welcome, Explorer!
          </h1>
          <p className="text-purple-600 text-lg">Ready for an adventure?</p>
        </div>
        {!isLoggedIn && (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="relative">
              <User className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your Secret Agent Name"
                required
                className="w-full p-3 pl-10 border-2 border-purple-300 rounded-full focus:outline-none focus:border-purple-500 transition-colors duration-300"
              />
            </div>
            <div className="relative">
              <Key className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Super Secret Code"
                required
                className="w-full p-3 pl-10 border-2 border-purple-300 rounded-full focus:outline-none focus:border-purple-500 transition-colors duration-300"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-full text-lg font-semibold hover:from-green-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            >
              Start Your Adventure!
            </button>
          </form>
        )}
        {timeLimit !== null && (
          <div className="bg-purple-100 p-6 text-center">
            <h2 className="text-xl font-bold text-purple-800 mb-2">
              Your Quest Time:
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="text-purple-500" />
              <p className="text-3xl font-bold text-purple-600">
                {timeLimit} minutes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

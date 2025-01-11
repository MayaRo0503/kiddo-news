"use client";

import { useState, useEffect } from "react";
import { useAuth } from "app/contexts/AuthContext";

export default function ChildLoginPage() {
  const { login } = useAuth();
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
        alert(data.error || "Login failed");
        return;
      }

      alert("Login successful!");
      login(data.token);
      setTimeLimit(data.child.timeLimit);
    } catch (error) {
      console.error("Error during login:", error);
      alert("Something went wrong. Please try again.");
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

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Child Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Child's Username"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Parent's Password"
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Login
        </button>
      </form>
      {timeLimit !== null && (
        <div className="mt-6 text-center">
          <h2 className="text-lg font-bold">Remaining Time:</h2>
          <p className="text-2xl font-semibold text-red-500">
            {timeLimit} minutes
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); // For error handling
  const [loading, setLoading] = useState(false); // For showing loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      // Handle successful login
      const { token } = await res.json();
      localStorage.setItem("token", token); // Save token for authenticated requests
      window.location.href = "/dashboard"; // Redirect after login
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Login
        </h1>
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-bold text-white rounded-lg shadow-md ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } transition-all`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

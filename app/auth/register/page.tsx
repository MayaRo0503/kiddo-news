"use client";

import React, { useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ParentAuthPage() {
  useAuth();
  const router = useRouter();
  const [isLogin] = useState(false); // Default to registration mode since this is the register page
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    childName: "",
    timeLimit: 30, // Default daily time limit (in minutes)
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setError(""); // Clear error on input change
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, timeLimit: Number(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    const endpoint = "/api/auth/register";

    const body = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      childName: formData.childName,
      timeLimit: formData.timeLimit,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md transition-all transform scale-100">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Sign Up
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Sign up to create an account and start managing news for your child.
        </p>

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
            <p>
              Registration successful! Please verify your email to activate your
              account. Redirecting to login...
            </p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              aria-label="Email"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              aria-label="Password"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              aria-label="Confirm Password"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              aria-label="First Name"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              aria-label="Last Name"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              placeholder="Child's Name"
              required
              aria-label="Child's Name"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <div>
              <label
                htmlFor="timeLimit"
                className="block text-sm text-gray-600"
              >
                Daily Time Limit (minutes)
              </label>
              <input
                type="range"
                id="timeLimit"
                name="timeLimit"
                min="10"
                max="120"
                step="10"
                value={formData.timeLimit}
                onChange={handleSliderChange}
                className="w-full"
              />
              <p className="text-sm text-center text-gray-600 mt-1">
                {formData.timeLimit} minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 font-bold text-white rounded-lg shadow-md ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } transition-all`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-blue-500 hover:underline font-medium"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}

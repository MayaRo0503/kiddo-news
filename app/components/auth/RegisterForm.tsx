"use client";

import React, { useState } from "react";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    childName: "",
    timeLimit: 30, // Default daily time limit in minutes
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/auth/login"; // Redirect to login
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-purple-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-2">
          Register
        </h1>
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
            <p>Registration successful! Redirecting to login...</p>
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
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              placeholder="Child's Name"
              required
              className="w-full px-4 py-2 border rounded-lg"
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
              className={`w-full px-4 py-2 font-bold text-white rounded-lg ${
                loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

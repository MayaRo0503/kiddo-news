"use client";

import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    childName: "",
    timeLimit: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          childName: formData.childName,
          timeLimit: Number(formData.timeLimit),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "An error occurred");
        return;
      }

      if (isLogin) {
        alert("Login successful!");
        console.log("User details:", data.user);
      } else {
        alert("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isLogin
          ? "Parent Login - Kiddo News"
          : "Parent Registration - Kiddo News"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Parent's Email"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full p-2 border rounded"
        />
        {!isLogin && (
          <>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Parent's First Name"
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Parent's Last Name"
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              placeholder="Child's Name"
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleChange}
              placeholder="Daily Time Limit (minutes)"
              required
              className="w-full p-2 border rounded"
            />
          </>
        )}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p className="mt-4 text-center">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:underline"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}

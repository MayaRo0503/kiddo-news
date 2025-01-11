"use client";

import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Welcome to Kiddo News
      </h1>
      <p className="text-center mb-6">
        Please select who you want to log in as:
      </p>
      <div className="flex justify-center space-x-8">
        {/* Parent Login Option */}
        <div
          className="cursor-pointer hover:scale-105 transform transition"
          onClick={() => router.push("/auth/parent")}
        >
          <img
            src="/parent-icon.png" // Replace with the path to your parent image
            alt="Parent Login"
            className="w-32 h-32 rounded-full border-2 border-blue-500"
          />
          <p className="text-center mt-2 font-semibold text-blue-500">
            Parent Login
          </p>
        </div>

        {/* Child Login Option */}
        <div
          className="cursor-pointer hover:scale-105 transform transition"
          onClick={() => router.push("/auth/child")}
        >
          <img
            src="/child-icon.png" // Replace with the path to your child image
            alt="Child Login"
            className="w-32 h-32 rounded-full border-2 border-green-500"
          />
          <p className="text-center mt-2 font-semibold text-green-500">
            Child Login
          </p>
        </div>
      </div>
    </div>
  );
}

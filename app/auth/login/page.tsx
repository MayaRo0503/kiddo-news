"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function LoginSelectionPage() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-blue-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">
          Who&apos;s Logging In?
        </h1>
        <p className="text-sm text-gray-700 mt-2">
          Select the type of user to continue.
        </p>
      </div>

      <div className="flex items-center justify-center gap-10">
        {/* Parent Login Circle */}
        <button
          onClick={() => handleNavigation("/auth/parent")}
          className="flex flex-col items-center justify-center w-40 h-40 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-all shadow-md"
        >
          <span className="text-lg font-bold">Parent</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mt-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5a6 6 0 11-9 0 6 6 0 019 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21v-4m0-4v4m-4-4h8m-8 0v-4m8 4v-4"
            />
          </svg>
        </button>

        {/* Child Login Circle */}
        <button
          onClick={() => handleNavigation("/auth/child")}
          className="flex flex-col items-center justify-center w-40 h-40 rounded-full bg-pink-400 text-white hover:bg-pink-500 transition-all shadow-md"
        >
          <span className="text-lg font-bold">Child</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mt-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 6.75a3 3 0 113 3 3 3 0 01-3-3zm3 3v4.5a1.5 1.5 0 003 0v-4.5m-3 0H7.5m3 4.5h1.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

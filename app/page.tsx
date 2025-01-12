"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Custom hook for parallax effect on mouse move
const useParallax = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
};

export default function AuthPage() {
  const router = useRouter();
  const { x, y } = useParallax();

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-blue-400 via-purple-300 to-pink-300">
      {/* Animated background shapes */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-0 -left-4"></div>
        <div className="absolute w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 top-0 -right-4"></div>
        <div className="absolute w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 bottom-0 left-1/2 transform -translate-x-1/2"></div>
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Main content container */}
        <div
          className="max-w-4xl w-full mx-auto text-center relative"
          style={{
            transform: `translate(${x}px, ${y}px)`,
            transition: "transform 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div className="mb-12 space-y-4">
            <h1 className="text-6xl font-bold text-white drop-shadow-lg animate-bounce-slow">
              Welcome to Kiddo News! 🎈
            </h1>
            <p className="text-2xl text-white/90 font-medium animate-fade-in">
              Your amazing adventure starts here! ✨
            </p>
          </div>

          {/* Login options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto px-4">
            {/* Parent Option */}
            <div
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/auth/parent")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl rotate-2 group-hover:rotate-6 transition-transform duration-300"></div>
                <div className="relative bg-white p-8 rounded-2xl transform group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="mb-4 relative">
                    <div className="w-32 h-32 mx-auto relative">
                      <div className="absolute inset-0 bg-blue-200 rounded-full animate-pulse"></div>
                      <img
                        src="/parent-icon.png"
                        alt="Parent Login"
                        className="relative w-full h-full object-cover rounded-full border-4 border-blue-400"
                      />
                    </div>
                    <div className="absolute -right-2 -top-2 bg-blue-500 text-white p-2 rounded-full transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                      👨‍👩‍👧‍👦
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-blue-600 mb-2">
                    I&apos;m a Parent
                  </h2>
                  <p className="text-blue-500 text-sm">
                    Guide and explore with your child
                  </p>
                </div>
              </div>
            </div>

            {/* Child Option */}
            <div
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/auth/child")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-2xl -rotate-2 group-hover:-rotate-6 transition-transform duration-300"></div>
                <div className="relative bg-white p-8 rounded-2xl transform group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="mb-4 relative">
                    <div className="w-32 h-32 mx-auto relative">
                      <div className="absolute inset-0 bg-pink-200 rounded-full animate-pulse"></div>
                      <img
                        src="/child-icon.png"
                        alt="Child Login"
                        className="relative w-full h-full object-cover rounded-full border-4 border-pink-400"
                      />
                    </div>
                    <div className="absolute -right-2 -top-2 bg-pink-500 text-white p-2 rounded-full transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
                      🌟
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-pink-600 mb-2">
                    I&apos;m a Kid!
                  </h2>
                  <p className="text-pink-500 text-sm">
                    Start your fun adventure!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="mt-12">
            <div className="inline-block animate-bounce-slow">
              <div className="bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl">
                <span className="text-lg text-purple-600 font-bold">
                  Click on any bubble to begin! 🚀
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

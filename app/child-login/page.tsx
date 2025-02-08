"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const visualPasswords = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
];

export default function ChildLogin() {
  const [username, setUsername] = useState("");
  const [visualPassword, setVisualPassword] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically check if the username exists
    setStep(2);
  };

  const handleVisualPasswordClick = (emoji: string) => {
    setVisualPassword([...visualPassword, emoji]);
  };

  const handleLogin = async () => {
    // Here you would typically verify the visual password and request parental approval
    toast.info("Requesting parental approval...");
    // Simulate parental approval after 3 seconds
    setTimeout(() => {
      toast.success("Login approved!");
      router.push("/kids-news");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-300 via-green-300 to-blue-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to KidsNews!
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <Input
                placeholder="Enter your fun username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-lg"
              />
              <Button type="submit" className="w-full text-lg">
                Next
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {visualPasswords.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => handleVisualPasswordClick(emoji)}
                    className="text-3xl h-16"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              <div className="text-center text-2xl">
                {visualPassword.join(" ")}
              </div>
              <Button onClick={handleLogin} className="w-full text-lg">
                Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
}

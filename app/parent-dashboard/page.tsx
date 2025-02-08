"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ChildProfile {
  id: string;
  name: string;
  username: string;
  timeLimit: number;
}

export default function ParentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [newChild, setNewChild] = useState({ name: "", username: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchChildProfiles();
    }
  }, [session]);

  async function fetchChildProfiles() {
    try {
      const response = await fetch("/api/child-profiles");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch child profiles");
      }
      const data = await response.json();
      setChildProfiles(data);
    } catch (error) {
      console.error("Error fetching child profiles:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch child profiles"
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!newChild.name || !newChild.username) {
        toast.error("Please fill in all fields");
        return;
      }

      const response = await fetch("/api/child-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChild),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create child profile");
      }

      toast.success("Child profile added successfully");
      setNewChild({ name: "", username: "" });
      await fetchChildProfiles();
    } catch (error) {
      console.error("Error adding child profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add child profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Parent Dashboard</h1>
      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles">Child Profiles</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Add Child Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="childName">Child&apos;s Name</Label>
                  <Input
                    id="childName"
                    value={newChild.name}
                    onChange={(e) =>
                      setNewChild({ ...newChild, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="childUsername">Child&apos;s Username</Label>
                  <Input
                    id="childUsername"
                    value={newChild.username}
                    onChange={(e) =>
                      setNewChild({ ...newChild, username: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Child Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="mt-6 space-y-4">
            {childProfiles.map((child) => (
              <Card key={child.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{child.name}</h3>
                    <p className="text-sm text-gray-500">
                      Username: {child.username}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Activity tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Statistics tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ToastContainer />
    </div>
  );
}

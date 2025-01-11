"use client";

import { useEffect, useState } from "react";
import { Parent } from "@/types"; // Import the Parent interface

const ParentProfile = () => {
  const [parent, setParent] = useState<Parent | null>(null); // Use the Parent interface

  useEffect(() => {
    const fetchParentProfile = async () => {
      const response = await fetch("/api/auth/parent", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setParent(data.parent); // Set the parent object
      } else {
        console.error(data.error);
      }
    };

    fetchParentProfile();
  }, []);

  if (!parent) return <p>Loading...</p>;

  return (
    <div>
      <h1>Parent Profile</h1>
      <p>Email: {parent.email}</p>
      <p>First Name: {parent.firstName}</p>
      <p>Last Name: {parent.lastName}</p>
      <h2>Child Information</h2>
      <p>Name: {parent.child.name}</p>
      <p>Time Limit: {parent.child.timeLimit} minutes</p>
    </div>
  );
};

export default ParentProfile;

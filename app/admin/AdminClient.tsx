// app/admin/AdminClient.tsx (Client Component)
"use client"; // Mark as a Client Component

import { useState } from "react";

export default function AdminClient() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button
        className="border p-2 mt-4"
        onClick={() => setCount((prev) => prev + 1)}
      >
        Click Me
      </button>
      <p>You clicked {count} times.</p>
    </>
  );
}

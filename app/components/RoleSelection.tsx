import { useRouter } from "next/router";

export default function RoleSelection() {
  const router = useRouter();

  return (
    <div>
      <h1>Login as:</h1>
      <button onClick={() => router.push("/login/parent")}>Parent</button>
      <button onClick={() => router.push("/login/child")}>Child</button>
    </div>
  );
}

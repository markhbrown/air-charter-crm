import { redirect } from "next/navigation";

// Entry point. The proxy/middleware enforces auth, sending unauthenticated
// users to /login; everyone else lands on the dashboard.
export default function Home() {
  redirect("/dashboard");
}

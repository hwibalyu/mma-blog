import AdminDashboardClient from "./page-client";
import { getPosts } from "@/lib/data";

export default function AdminPage() {
  const initialPosts = getPosts();

  return <AdminDashboardClient initialPosts={initialPosts} />;
}

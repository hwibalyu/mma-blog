import AdminDashboardClient from "./page-client";
import { getPosts } from "@/lib/data";
import { notFound } from "next/navigation";

export default function AdminPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const initialPosts = getPosts();

  return <AdminDashboardClient initialPosts={initialPosts} />;
}

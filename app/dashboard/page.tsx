"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setChecking(false);
        fetchPosts();
      }
    }
    checkUser();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
  }

  async function handleCreate() {
    setLoading(true);
    const { error } = await supabase
      .from("posts")
      .insert({ title, summary, content });

    if (error) {
      setMessage("Error creating post: " + error.message);
    } else {
      setMessage("Post created successfully! ✅");
      setTitle("");
      setSummary("");
      setContent("");
      fetchPosts();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("posts").delete().eq("id", id);
    fetchPosts();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">New Post</h2>

        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Short summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Write your blog post content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreate}
          disabled={loading || !title}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Post"}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Your Posts ({posts.length})
        </h2>
        {posts.length === 0 && (
          <p className="text-gray-500">
            No posts yet. Write your first one above!
          </p>
        )}
        {posts.map((post) => (
          <div
            key={post.id}
            className="border rounded-xl p-4 mb-3 flex justify-between items-start"
          >
            <div>
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-gray-500 text-sm">{post.summary}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(post.id)}
              className="text-red-500 hover:text-red-700 text-sm ml-4"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

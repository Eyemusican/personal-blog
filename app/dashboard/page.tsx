"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file);
    if (error) {
      setMessage("Image upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);
    setImageUrl(urlData.publicUrl);
    setMessage(
      "Image uploaded! ✅ Copy this into your content: ![image](" +
        urlData.publicUrl +
        ")",
    );
    setUploading(false);
  }

  function handleEdit(post: any) {
    setEditingId(post.id);
    setTitle(post.title);
    setSummary(post.summary);
    setContent(post.content);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle("");
    setSummary("");
    setContent("");
    setMessage("");
  }

  async function handleSave() {
    setLoading(true);
    if (editingId) {
      const { error } = await supabase
        .from("posts")
        .update({
          title,
          summary,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);
      if (error) {
        setMessage("Error updating post: " + error.message);
      } else {
        setMessage("Post updated successfully! ✅");
        setEditingId(null);
        setTitle("");
        setSummary("");
        setContent("");
        fetchPosts();
      }
    } else {
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
        setImageUrl("");
        fetchPosts();
      }
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
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
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "✏️ Editing Post" : "New Post"}
        </h2>

        {message && (
          <p className="text-green-600 text-sm mb-4 break-all">{message}</p>
        )}

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

        <div className="mb-3 border rounded-lg px-4 py-3 bg-gray-50">
          <p className="text-sm text-gray-500 mb-2">
            Upload an image to use in your post:
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
          />
          {uploading && (
            <p className="text-sm text-blue-500 mt-1">Uploading...</p>
          )}
          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="uploaded" className="h-20 rounded" />
              <p className="text-xs text-gray-400 mt-1 break-all">
                Paste in content: ![image]({imageUrl})
              </p>
            </div>
          )}
        </div>

        <textarea
          placeholder="Write your blog post content here... Use markdown! ## Heading, **bold**, - bullet, ![image](url)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading || !title}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Post" : "Publish Post"}
          </button>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
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
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(post)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

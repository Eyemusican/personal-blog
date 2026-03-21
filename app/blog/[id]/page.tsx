import { createClient } from "@/lib/supabase";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-gray-400">Post not found.</p>
        <Link href="/" className="text-purple-500 text-sm">
          ← back home
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 min-h-screen">
      <Link
        href="/"
        className="text-sm text-purple-400 hover:text-purple-600 transition-colors"
      >
        ← back to all posts
      </Link>
      <article className="mt-8">
        <div className="mb-6">
          <p className="text-xs text-gray-300 mb-2">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-3xl font-medium text-gray-900 leading-snug mb-3">
            {post.title}
          </h1>
          <p className="text-base text-gray-400 pb-6 border-b border-gray-100">
            {post.summary}
          </p>
        </div>
        <div className="prose prose-gray max-w-none prose-headings:font-medium prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-800 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
      <div className="mt-16 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-300">made with love by tenzin namgay</p>
      </div>
    </main>
  );
}

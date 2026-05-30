import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center py-10 mb-8">
        <span className="inline-block bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full mb-4">
          weekly learning journal
        </span>
        <h1 className="text-3xl font-medium text-gray-900 leading-snug mb-3">
          learning in public,
          <br />
          <span className="text-purple-500">one week at a time</span>
        </h1>
        <p className="text-sm text-gray-400">
          documenting my journey as a developer
        </p>
      </div>
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-300">recent posts</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="space-y-4">
        {posts && posts.length === 0 && (
          <p className="text-center text-gray-300 py-12">no posts yet</p>
        )}
        {posts &&
          posts.map((post, index) => (
            <Link href={`/blog/${post.id}`} key={post.id}>
              <div className="border border-gray-100 rounded-xl p-5 hover:border-purple-300 transition-colors cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs bg-purple-50 text-purple-500 px-3 py-1 rounded-full font-medium">
                    week {posts.length - index}
                  </span>
                  <span className="text-xs text-gray-300">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-base font-medium text-gray-800 mb-1">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">
                  {post.summary}
                </p>
                <div className="pt-3 border-t border-gray-50">
                  <span className="text-xs text-purple-400">read post →</span>
                </div>
              </div>
            </Link>
          ))}
      </div>
      <div className="text-center mt-16 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-300">made with love by tenzin namgay</p>
      </div>
    </main>
  );
}

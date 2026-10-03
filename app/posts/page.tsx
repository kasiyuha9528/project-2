import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "記事一覧",
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium">記事一覧</h1>
      <ul className="grid gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="block rounded-xl border border-gray-200 p-4 transition hover:border-gray-400"
            >
              <p className="text-sm text-gray-500">{post.date}</p>
              <h2 className="mt-1 text-lg font-medium">{post.title}</h2>
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

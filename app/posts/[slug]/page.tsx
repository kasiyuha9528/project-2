import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

// ビルド時に、どの slug のページを作るかを Next.js に伝える
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// generateStaticParams にない slug は 404 にする
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article>
      <Link href="/posts" className="text-sm text-gray-500 hover:underline">
        ← 記事一覧へ
      </Link>
      <header className="mt-4 mb-8">
        <p className="text-sm text-gray-500">{post.date}</p>
        <h1 className="mt-1 text-3xl font-medium">{post.title}</h1>
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
      </header>
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}

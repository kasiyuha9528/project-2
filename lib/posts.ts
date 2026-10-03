import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

// process.cwd() 基準にしておくと、ビルド環境でもパスがずれない
const postsDir = path.join(process.cwd(), "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
};

export type Post = PostMeta & {
  html: string;
};

/** /posts 内の .md のファイル名(拡張子なし)= slug の一覧 */
export function getAllSlugs(): string[] {
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

/** frontmatter の必須項目を確認して、型の整ったメタ情報にそろえる */
function toMeta(slug: string, data: Record<string, unknown>): PostMeta {
  if (typeof data.title !== "string" || data.title === "") {
    throw new Error(`[${slug}.md] frontmatter に title がありません`);
  }
  if (typeof data.date !== "string" || data.date === "") {
    throw new Error(
      `[${slug}.md] frontmatter の date は "2026-10-03" のように引用符つきの文字列で書いてください`
    );
  }
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  return { slug, title: data.title, date: data.date, tags };
}

/** 一覧ページ用: 全記事のメタ情報を新しい順で返す */
export function getAllPosts(): PostMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(postsDir, `${slug}.md`), "utf8");
      const { data } = matter(raw);
      return toMeta(slug, data);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 詳細ページ用: slug に対応する記事を、本文を HTML にして返す。なければ null */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const meta = toMeta(slug, data);

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight, { detect: false })
    .use(rehypeStringify)
    .process(content);

  return { ...meta, html: String(file) };
}

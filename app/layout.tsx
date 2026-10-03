import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Markdown ブログ",
    template: "%s | Markdown ブログ",
  },
  description: "Markdown ファイルから静的生成するブログ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <Link href="/posts" className="text-lg font-medium">
              Markdown ブログ
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

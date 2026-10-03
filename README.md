# Markdown ブログ(静的生成)

Next.js + gray-matter + remark/rehype + Tailwind で作った、Markdown から静的生成するブログです。

## 動かし方

```bash
npm install
npm run dev      # 開発モード: http://localhost:3000
npm run build    # 本番ビルド(達成基準: これが通ること)
npm run start    # ビルド結果を本番と同じ状態で確認(Lighthouse はここで測る)
```

## 記事の追加

`posts/` に `.md` を1本足します。ファイル名がそのまま URL(`/posts/ファイル名`)になります。

```md
---
title: 記事のタイトル
date: "2026-10-03"
tags: [Next.js, ブログ]
---

本文をここに書きます。
```

- `date` は引用符つきの文字列で書く
- `tags` は配列で書く
- title / date がないとビルドが失敗する(`lib/posts.ts` で確認している)

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `lib/posts.ts` | md の読み込み、frontmatter のパース、本文の HTML 変換 |
| `app/posts/page.tsx` | 一覧ページ(カード表示) |
| `app/posts/[slug]/page.tsx` | 詳細ページ(`generateStaticParams` で静的生成) |
| `app/globals.css` | Tailwind とコードの色付けテーマ |
| `posts/*.md` | サンプル記事 5本 |

---
title: Vercel で公開する
date: "2026-10-05"
tags: [Vercel, デプロイ]
---

作ったブログを Vercel で公開する流れを整理します。

## 事前に用意するもの

- GitHub のアカウントとリポジトリ
- Vercel のアカウント

## 公開までの流れ

### リポジトリを連携する

Vercel でリポジトリを選ぶと、Next.js のプロジェクトとして自動で認識されます。

### 記事を追加して公開する

```bash
git add posts/new-post.md
git commit -m "新しい記事を追加"
git push
```

push すると、Vercel が自動で `next build` を実行して、サイトが更新されます。

## ビルドが失敗したときは

frontmatter の書き間違いなどでビルドが失敗すると、公開は更新されず、前のバージョンのまま残ります。Vercel の画面でエラー内容を確認できます。

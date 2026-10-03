---
title: 静的サイト生成(SSG)とは
date: "2026-10-03"
tags: [Next.js, SSG]
---

静的サイト生成(SSG)は、ページをあらかじめビルド時に作っておく方式です。

## 動的に作る方式との違い

| 方式 | ページを作るタイミング | 表示の速さ |
| --- | --- | --- |
| SSG | ビルド時に1回だけ | 速い |
| 毎回サーバーで生成 | アクセスのたび | 処理が必要なぶん遅くなる |

## Next.js での書き方

### generateStaticParams

どの URL のページを作るかを、ビルド時に Next.js に伝える関数です。

```ts
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}
```

### 確認用のコマンド

```bash
npm run build
npm run start
```

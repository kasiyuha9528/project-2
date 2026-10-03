---
title: コードブロックの色付け
date: "2026-10-04"
tags: [rehype, シンタックスハイライト]
---

コードブロックに色を付けると、コードが読みやすくなります。

## 仕組み

md のコードブロックに言語名を付けると、ビルド時に単語が種類ごとに分類され、色の目印が付きます。

### JavaScript の例

```js
function greet(name) {
  return `Hello, ${name}`;
}

const result = greet("Next.js");
```

### TypeScript の例

```ts
type Post = {
  slug: string;
  title: string;
  tags: string[];
};
```

### シェルの例

```bash
npm install gray-matter
npm run build
```

## 色はどこで決まるか

色の見た目は CSS のテーマで決まります。このブログでは `globals.css` に定義しています。

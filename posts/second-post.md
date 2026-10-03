---
title: frontmatter の書き方
date: "2026-10-02"
tags: [Markdown, gray-matter]
---

記事の先頭に書くメタ情報を、frontmatter と呼びます。

## 書き方のルール

先頭を `---` で囲み、その中に項目を書きます。

```md
---
title: 記事のタイトル
date: "2026-10-03"
tags: [Next.js, ブログ]
---
```

### 日付は引用符で囲む

`date` は `"2026-10-03"` のように引用符で囲んで、文字列として書きます。

### tags は配列で書く

`tags: [A, B]` の形に統一しておくと、表示が崩れません。

## 読み取りには gray-matter を使う

```ts
import matter from "gray-matter";

const { data, content } = matter(raw);
console.log(data.title);
```

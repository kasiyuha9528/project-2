# このプロジェクトで学んだこと

Markdown から静的生成するブログ(Next.js + gray-matter + remark/rehype + Tailwind)を作る中で得た知見のまとめです。コードに現れている設計判断と、その理由を中心に記録しています。

## 1. 全体の仕組み

```
posts/*.md ──(gray-matter)──> frontmatter + 本文
                                   │
                    本文 ──(unified: remark → rehype)──> HTML
                                   │
        app/posts/[slug]/page.tsx が generateStaticParams で全記事を静的生成
```

- 記事は `posts/` に `.md` を置くだけ。ファイル名がそのまま slug(URL)になる。
- 読み込み・変換は `lib/posts.ts` に集約し、ページ側(`app/`)は表示だけに専念させた。役割を分けると、ページのコードが短く読みやすくなる。

### `lib/` と `app/` の役割分担

**`lib/posts.ts`: 記事データを扱う層(データ層)**
- `posts/` の読み込み、frontmatter のパース、本文の HTML 変換、`title` / `date` の検証(`toMeta`)を担当する。
- 画面のことは一切知らない。React や Next.js の API も使わない。
- 公開している関数は3つ。
  - `getAllSlugs()`: slug の一覧
  - `getAllPosts()`: 一覧用のメタ情報(新しい順)
  - `getPostBySlug(slug)`: 詳細用の記事(HTML つき)

**`app/`: 表示とルーティングの層(UI 層)**
- フォルダ構成がそのまま URL になる(`app/posts/[slug]/page.tsx` → `/posts/xxx`)。
- `lib/posts.ts` の関数を呼び、返ってきたデータをレイアウトや Tailwind のクラスで表示するだけにする。
- `generateStaticParams`、`generateMetadata`、`notFound()`、`dynamicParams` など Next.js 固有の処理もここに置く。

**分けるメリット**
1. ページのコードが短くなる。Markdown 変換の細部がページから見えない。
2. 変更の影響範囲が狭い。色付けやタグの扱いを変えるなら `lib/` だけ、デザインを変えるなら `app/` だけを直せばよい。
3. 検証が一か所に集まる。一覧も詳細も `toMeta()` を通るので、不正な記事はどの経路でも同じエラーでビルドが止まる。
4. 記事の保存先が CMS などに変わっても、`lib/` の中身を差し替えれば `app/` はほぼそのまま使える。

**判断の目安**
- 「記事とは何か、どこから来るか」に関わる処理は `lib/` に置く。
- 「どう見せるか、どの URL で出すか」に関わる処理は `app/` に置く。

## 2. Next.js(App Router)

### 静的生成は `generateStaticParams` で決まる
動的ルート `[slug]` は、ビルド時に「どの slug を作るか」を `generateStaticParams` で教える必要がある。`getAllSlugs()` を返すだけで、記事ごとの HTML がビルド時に生成される。

### `dynamicParams = false` で未知の slug を 404 にする
`generateStaticParams` に含まれない URL は、既定ではオンデマンドで描画しようとする。`export const dynamicParams = false;` を付けると、存在しない記事は確実に 404 になる。

### Next.js 15 では `params` が Promise
`params` は `Promise<{ slug: string }>` になっており、`await params` してから使う。`generateMetadata` とページ本体の両方で必要。型定義(`Props`)もそれに合わせる。

### タイトルは layout の `template` で一元管理
`layout.tsx` の `metadata.title` に `default` と `template: "%s | Markdown ブログ"` を指定すると、各記事側は `title: post.title` を返すだけで「記事名 | サイト名」になる。

### パスは `process.cwd()` 基準にする
`path.join(process.cwd(), "posts")` としておくと、ビルド環境(Vercel など)でも参照先がずれない。ファイル相対パスより安全。

## 3. Markdown の処理(unified エコシステム)

### パイプラインの順序
```ts
unified()
  .use(remarkParse)        // Markdown → mdast
  .use(remarkGfm)          // 表・取り消し線などの GFM 拡張
  .use(remarkRehype)       // mdast → hast(HTML の木構造)
  .use(rehypeHighlight, { detect: false })  // コードの色付け
  .use(rehypeStringify)    // hast → HTML 文字列
```
remark は Markdown の世界、rehype は HTML の世界。`remarkRehype` が両者の橋渡しで、色付けのような HTML 向けの処理はその後ろに置く。

### `rehype-highlight` は色を付けない
色そのものは埋め込まず、`hljs-keyword` などの **クラス名を付けるだけ**。実際の色は `globals.css` に自分で定義する必要がある(このプロジェクトでは GitHub ダーク風の配色を定義した)。「色付けしたのに色が出ない」ときは、まずテーマ CSS がないことを疑う。

### `detect: false` で言語の自動判定を切る
言語指定のないコードブロックまで自動判定すると、誤った色が付くことがある。言語指定(```` ```ts ````)があるブロックだけ色付けする方針にした。

### 本文は `dangerouslySetInnerHTML` で表示する
変換結果は HTML 文字列なので、`dangerouslySetInnerHTML` で埋め込む。名前は物騒だが、ここでは **自分が書いた Markdown だけ** が入力なので問題ない。外部の人の入力を同じ方法で表示するなら、サニタイズが必須。

## 4. frontmatter の落とし穴

### `date` は引用符つきの文字列で書く
YAML では `date: 2026-10-03` と書くと、gray-matter が **`Date` オブジェクト** に変換してしまう。そのため `"2026-10-03"` と引用符で囲んで文字列にする。文字列なら ISO 形式の比較(`a.date < b.date`)だけで新しい順に並べ替えられる利点もある。

### 型を信用せず、読み込み時に検証する
`matter()` が返す `data` は実質 `any`。`toMeta()` で `title` と `date` の型・空文字を検査し、足りなければ **ファイル名つきのエラーを投げてビルドを失敗させる**。
- 壊れた記事が気づかれないまま公開されるのを防げる
- エラーメッセージに「どのファイルの何が悪いか」「どう書けばよいか」を含めると直しやすい
- `tags` は任意項目として、配列でなければ空配列にフォールバックした

## 5. Tailwind CSS v4 と Typography

- v4 は設定ファイル(`tailwind.config.js`)なしで使える。`globals.css` に `@import "tailwindcss";` を書き、PostCSS 側は `@tailwindcss/postcss` を指定する。
- プラグインは CSS 内で `@plugin "@tailwindcss/typography";` と宣言する(v3 の `plugins: []` 配列とは書き方が違う)。
- 本文のコンテナに `prose prose-gray max-w-none` を付けるだけで、見出し・リスト・表・引用が読みやすく整う。`prose` は既定で横幅を制限するため、レイアウト側で幅を決めるなら `max-w-none` で外す。
- `prose pre` の背景色は `globals.css` で上書きしてコードのテーマと揃えた。

## 6. 運用・デプロイ

- 完了条件は **`npm run build` が通ること**。静的生成のブログでは、記事の不備もビルド時に検出できる。
- 表示確認や Lighthouse 計測は `npm run dev` ではなく、`npm run build` → `npm run start` で **本番と同じ状態** に対して行う。開発モードは最適化されていないため数値が当てにならない。
- Vercel は GitHub に push すると自動で `next build` を実行する。ビルドが失敗しても公開中のバージョンは更新されず前のまま残るので、壊れたサイトが公開される心配はない(詳細は `posts/deploy-to-vercel.md`)。

## 7. 次に試したいこと

- 記事の下書き(`draft: true`)を本番では除外する
- タグ別の一覧ページ
- RSS フィードやサイトマップの生成
- OGP 画像・記事ごとの `description`

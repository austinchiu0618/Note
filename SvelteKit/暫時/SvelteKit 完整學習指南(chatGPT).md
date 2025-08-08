# SvelteKit 完整學習指南 📚

> 全面學習 SvelteKit，掌握現代化前端框架的最佳實踐

## 🎯 學習路線圖

這份指南以 SvelteKit 為主，介紹最新的語法、專案結構、路由、資料獲取、API、部署等，適合初學者到中級開發者。

---

## 📋 目錄

### 第一部分：基礎入門
1. [專案建立與環境設置](#1-專案建立與環境設置)
2. [專案結構與檔案說明](#2-專案結構與檔案說明)
3. [路由系統](#3-路由系統)
4. [頁面與元件](#4-頁面與元件)

### 第二部分：資料與互動
5. [資料獲取與載入函式](#5-資料獲取與載入函式)
6. [表單處理與動作](#6-表單處理與動作)
7. [API 與 endpoints](#7-api-與-endpoints)

### 第三部分：進階功能
8. [狀態管理](#8-狀態管理)
9. [佈局與巢狀路由](#9-佈局與巢狀路由)
10. [錯誤處理與自訂錯誤頁](#10-錯誤處理與自訂錯誤頁)
11. [SEO 與 meta 標籤](#11-seo-與-meta-標籤)
12. [靜態資源與 assets](#12-靜態資源與-assets)

### 第四部分：部署與最佳實踐
13. [部署到 Vercel/Netlify](#13-部署到-vercelnetlify)
14. [環境變數與設定](#14-環境變數與設定)
15. [最佳實踐與常見問題](#15-最佳實踐與常見問題)

---

## 1. 專案建立與環境設置

### 快速開始
```bash
# 建立 SvelteKit 專案
npm create svelte@latest my-app

# 進入專案
cd my-app

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

---

## 2. 專案結構與檔案說明

```
my-app/
├── src/
│   ├── routes/        # 路由與頁面
│   ├── lib/           # 共用元件、工具
│   ├── app.html       # HTML 模板
│   └── ...
├── static/            # 靜態資源
├── svelte.config.js   # SvelteKit 設定
└── package.json
```

- `src/routes/`：每個檔案對應一個路由（頁面）
- `src/lib/`：可重用的元件、工具
- `static/`：靜態檔案（如圖片、favicon）

---

## 3. 路由系統

- 檔案型路由，`src/routes/index.svelte` 對應 `/`
- `about.svelte` 對應 `/about`
- 巢狀資料夾即巢狀路由
- 支援動態路由（如 `[id].svelte`）

```bash
src/routes/
├── index.svelte      # 首頁
├── about.svelte      # /about
├── blog/
│   ├── [slug].svelte # /blog/任意slug
```

---

## 4. 頁面與元件

### 建立頁面
`src/routes/about.svelte`
```svelte
<script>
	let name = 'SvelteKit';
</script>

<h1>關於 {name}</h1>
```

### 共用元件
`src/lib/Button.svelte`
```svelte
<script>
	export let text = 'Click';
</script>
<button>{text}</button>
```

頁面中使用：
```svelte
<script>
	import Button from '$lib/Button.svelte';
</script>
<Button text="Hello" />
```

---

## 5. 資料獲取與載入函式

### 頁面載入資料
`src/routes/blog/[slug]/+page.js`
```js
export async function load({ params, fetch }) {
	const res = await fetch(`/api/posts/${params.slug}`);
	const post = await res.json();
	return { post };
}
```

`src/routes/blog/[slug]/+page.svelte`
```svelte
<script>
	export let data;
</script>

<h1>{data.post.title}</h1>
<p>{data.post.content}</p>
```

---

## 6. 表單處理與動作

### 使用 actions 處理表單
`src/routes/contact/+page.svelte`
```svelte
<form method="POST">
	<input name="name" />
	<button type="submit">送出</button>
</form>
```

`src/routes/contact/+page.server.js`
```js
export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		return { success: true, name };
	}
};
```

---

## 7. API 與 endpoints

`src/routes/api/hello/+server.js`
```js
export function GET() {
	return new Response(JSON.stringify({ message: 'Hello API' }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
```

---

## 8. 狀態管理

- 可用 Svelte store (`writable`, `readable`, `derived`)
- 也可用 $page.data, $session, context 等

`src/lib/stores/counter.js`
```js
import { writable } from 'svelte/store';
export const count = writable(0);
```

`src/routes/+page.svelte`
```svelte
<script>
	import { count } from '$lib/stores/counter.js';
</script>
<p>計數: {$count}</p>
<button on:click={() => count.update(n => n + 1)}>+1</button>
```

---

## 9. 佈局與巢狀路由

- `src/routes/+layout.svelte`：全域佈局
- 子資料夾可有自己的 `+layout.svelte`

```svelte
<!-- src/routes/+layout.svelte -->
<slot />
<footer>全站頁腳</footer>
```

---

## 10. 錯誤處理與自訂錯誤頁

- `src/error.svelte`：全域錯誤頁
- 可於 load/action 中 throw error

```svelte
<script>
	export let error, status;
</script>
<h1>{status}</h1>
<pre>{error.message}</pre>
```

---

## 11. SEO 與 meta 標籤

- 使用 `<svelte:head>` 設定 meta
```svelte
<svelte:head>
	<title>我的 SvelteKit 網站</title>
	<meta name="description" content="SvelteKit 學習指南" />
</svelte:head>
```

---

## 12. 靜態資源與 assets

- 放在 `static/` 目錄下，網址為 `/xxx`
- 例如 `static/logo.png` 可用 `<img src="/logo.png" />`

---

## 13. 部署到 Vercel/Netlify

- Vercel/Netlify 支援 SvelteKit，直接連接 GitHub 部署
- 也可靜態匯出：
```bash
npm run build
npm run preview
```

---

## 14. 環境變數與設定

- `.env` 檔案放在專案根目錄
- 使用 `import.meta.env.VITE_XXX` 取得

---

## 15. 最佳實踐與常見問題

- 善用型別提示與 TypeScript
- 路由、API、元件分層清楚
- 使用 `$lib` 路徑簡化 import
- 遇到問題多查官方文件與 Discord

---

## 🎯 學習建議

### 初學者路線
1. 先學會專案建立、路由、頁面
2. 練習資料獲取與 API
3. 理解表單與狀態管理
4. 學習佈局與錯誤處理

### 進階路線
1. 深入學習 endpoints、actions
2. 掌握巢狀路由與佈局
3. 學習部署與環境變數
4. 探索 SEO、最佳實踐

### 有用資源
- [SvelteKit 官方文件](https://kit.svelte.dev/)
- [Svelte Discord](https://svelte.dev/chat)
- [Svelte Society](https://sveltesociety.dev/)
- [SvelteKit REPL](https://kit.svelte.dev/repl)

---

## 🚀 快速參考

```svelte
<!-- 路由頁面 -->
src/routes/about.svelte

<!-- 動態路由 -->
src/routes/blog/[slug].svelte

<!-- 載入資料 -->
export async function load({ params, fetch }) { ... }

<!-- API endpoint -->
export function GET() { ... }

<!-- 佈局 -->
src/routes/+layout.svelte

<!-- 錯誤頁 -->
src/error.svelte
```

恭喜您完成 SvelteKit 完整學習指南！多練習、多查官方資源，Happy coding! 🎉

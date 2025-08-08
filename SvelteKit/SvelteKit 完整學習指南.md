# SvelteKit 完整學習指南 📚

> 全面學習 SvelteKit，掌握現代化全端框架的最佳實踐

## 🎯 學習路線圖

這份指南專注於 SvelteKit 框架，介紹專案架構、路由系統、資料載入、API 開發、部署等核心概念，適合初學者到中級開發者。

---

## 📋 目錄

### 第一部分：基礎入門
1. [專案建立與環境設置](#1-專案建立與環境設置)
2. [專案結構與核心概念](#2-專案結構與核心概念)
3. [路由系統基礎](#3-路由系統基礎)
4. [頁面與佈局](#4-頁面與佈局)
5. [載入資料](#5-載入資料)

### 第二部分：進階功能
6. [表單與動作](#6-表單與動作)
7. [API 路由與端點](#7-api-路由與端點)
8. [錯誤處理](#8-錯誤處理)
9. [環境變數與設定](#9-環境變數與設定)
10. [靜態資源處理](#10-靜態資源處理)

### 第三部分：進階開發
11. [高級路由功能](#11-高級路由功能)
12. [伺服器端渲染（SSR）](#12-伺服器端渲染ssr)
13. [預渲染與靜態網站](#13-預渲染與靜態網站)
14. [狀態管理策略](#14-狀態管理策略)
15. [SEO 與 Meta 標籤](#15-seo-與-meta-標籤)

### 第四部分：部署與最佳實踐
16. [部署到各平台](#16-部署到各平台)
17. [效能優化](#17-效能優化)
18. [測試策略](#18-測試策略)
19. [TypeScript 整合](#19-typescript-整合)
20. [最佳實踐與常見問題](#20-最佳實踐與常見問題)

---

## 1. 專案建立與環境設置

### 快速開始

```bash
# 建立新的 SvelteKit 專案
npm create svelte@latest my-sveltekit-app

# 選擇專案模板
# ✓ Which Svelte app template?
#   › Skeleton project
# ✓ Add type checking with TypeScript?
#   › Yes, using TypeScript syntax
# ✓ Select additional options
#   › Add ESLint for code linting
#   › Add Prettier for code formatting
#   › Add Playwright for browser testing

cd my-sveltekit-app
npm install
npm run dev
```

### 開發伺服器指令

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 預覽建置結果
npm run preview

# 執行測試
npm run test

# 執行 linting
npm run lint
```

---

## 2. 專案結構與核心概念

### 專案目錄結構

```
my-sveltekit-app/
├── src/
│   ├── routes/              # 檔案型路由系統
│   │   ├── +layout.svelte   # 根佈局
│   │   ├── +page.svelte     # 首頁
│   │   └── about/
│   │       └── +page.svelte # /about 頁面
│   ├── lib/                 # 共用組件與工具
│   ├── app.html             # HTML 模板
│   └── hooks.client.js      # 客戶端鉤子
├── static/                  # 靜態檔案
├── tests/                   # 測試檔案
├── svelte.config.js         # SvelteKit 設定
├── vite.config.js          # Vite 設定
└── package.json
```

### 核心概念

- **檔案型路由**：資料夾結構直接對應 URL 結構
- **SSR 優先**：預設伺服器端渲染，可選擇性啟用 CSR
- **漸進式增強**：從基本 HTML 開始，逐步增加互動功能
- **適配器模式**：支援不同部署平台（Vercel、Netlify、Node.js 等）

---

## 3. 路由系統基礎

### 基本路由

路由完全基於 `src/routes` 資料夾結構：

```
src/routes/
├── +page.svelte          # /
├── about/
│   └── +page.svelte      # /about
├── blog/
│   ├── +page.svelte      # /blog
│   └── [slug]/
│       └── +page.svelte  # /blog/[任何字串]
└── admin/
    ├── +layout.svelte    # /admin 的佈局
    └── dashboard/
        └── +page.svelte  # /admin/dashboard
```

### 動態路由

使用方括號建立動態路由：

```
src/routes/
├── products/
│   └── [id]/
│       └── +page.svelte  # /products/123
├── users/
│   └── [username]/
│       ├── +page.svelte      # /users/john
│       └── settings/
│           └── +page.svelte  # /users/john/settings
└── blog/
    └── [...slug]/
        └── +page.svelte  # /blog/2023/01/hello 等任意深度
```

### 路由參數存取

```svelte
<!-- src/routes/products/[id]/+page.svelte -->
<script>
	import { page } from '$app/stores';
	
	// 透過 page store 存取路由參數
	$: productId = $page.params.id;
	$: console.log('Product ID:', productId);
</script>

<h1>商品編號：{productId}</h1>
<p>當前路徑：{$page.url.pathname}</p>
<p>查詢參數：{$page.url.searchParams.get('color')}</p>
```

---

## 4. 頁面與佈局

### 基本頁面結構

每個頁面都是一個 `.svelte` 檔案：

```svelte
<!-- src/routes/about/+page.svelte -->
<script>
	let companyName = 'SvelteKit 公司';
	let founded = 2023;
</script>

<svelte:head>
	<title>關於我們 - {companyName}</title>
	<meta name="description" content="了解更多關於我們公司的資訊" />
</svelte:head>

<main>
	<h1>關於 {companyName}</h1>
	<p>我們成立於 {founded} 年</p>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}
</style>
```

### 根佈局

根佈局套用到所有頁面：

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<div class="app">
	<Header />
	
	<main>
		<!-- 這裡會渲染各個頁面的內容 -->
		<slot />
	</main>
	
	<Footer />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	main {
		flex: 1;
	}
</style>
```

### 巢狀佈局

特定路由群組可以有自己的佈局：

```svelte
<!-- src/routes/admin/+layout.svelte -->
<script>
	import Sidebar from '$lib/components/admin/Sidebar.svelte';
	import { page } from '$app/stores';
	
	// 檢查用戶權限
	$: isAuthenticated = checkAuth($page);
</script>

{#if isAuthenticated}
	<div class="admin-layout">
		<Sidebar />
		<main class="content">
			<slot />
		</main>
	</div>
{:else}
	<div class="auth-required">
		<h1>需要登入</h1>
		<a href="/login">前往登入</a>
	</div>
{/if}

<style>
	.admin-layout {
		display: grid;
		grid-template-columns: 250px 1fr;
		min-height: 100vh;
	}
	
	.content {
		padding: 2rem;
	}
</style>
```

---

## 5. 載入資料

### 基本載入函式

使用 `+page.js` 或 `+page.server.js` 載入資料：

```javascript
// src/routes/blog/+page.js
export async function load({ fetch }) {
	const response = await fetch('/api/posts');
	const posts = await response.json();
	
	return {
		posts
	};
}
```

在頁面中接收資料：

```svelte
<!-- src/routes/blog/+page.svelte -->
<script>
	export let data;
	
	$: posts = data.posts;
</script>

<h1>部落格文章</h1>

{#each posts as post}
	<article>
		<h2><a href="/blog/{post.slug}">{post.title}</a></h2>
		<p>{post.excerpt}</p>
		<time>{post.published}</time>
	</article>
{/each}
```

### 動態路由載入

```javascript
// src/routes/blog/[slug]/+page.js
export async function load({ params, fetch }) {
	const { slug } = params;
	
	try {
		const response = await fetch(`/api/posts/${slug}`);
		
		if (!response.ok) {
			throw error(404, '文章不存在');
		}
		
		const post = await response.json();
		
		return {
			post
		};
	} catch (err) {
		throw error(500, '載入文章時發生錯誤');
	}
}
```

### 伺服器端載入

```javascript
// src/routes/admin/+page.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, url }) {
	const token = cookies.get('auth-token');
	
	if (!token) {
		throw redirect(302, '/login');
	}
	
	// 在伺服器端執行，可存取私密資料
	const userData = await fetchUserData(token);
	
	return {
		user: userData
	};
}
```

### 並行載入資料

```javascript
// src/routes/dashboard/+page.js
export async function load({ fetch }) {
	// 並行載入多個資料源
	const [usersRes, ordersRes, statsRes] = await Promise.all([
		fetch('/api/users'),
		fetch('/api/orders'),
		fetch('/api/stats')
	]);
	
	return {
		users: await usersRes.json(),
		orders: await ordersRes.json(),
		stats: await statsRes.json()
	};
}
```

---

## 6. 表單與動作

### 基本表單處理

```svelte
<!-- src/routes/contact/+page.svelte -->
<script>
	import { enhance } from '$app/forms';
	
	export let form; // 接收動作回傳的資料
</script>

<h1>聯絡我們</h1>

<form method="POST" use:enhance>
	<label>
		姓名
		<input name="name" required />
	</label>
	
	<label>
		信箱
		<input name="email" type="email" required />
	</label>
	
	<label>
		訊息
		<textarea name="message" required></textarea>
	</label>
	
	<button type="submit">送出</button>
</form>

{#if form?.success}
	<p class="success">訊息已送出！</p>
{/if}

{#if form?.error}
	<p class="error">{form.error}</p>
{/if}
```

### 表單動作處理

```javascript
// src/routes/contact/+page.server.js
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const message = data.get('message');
		
		// 驗證資料
		if (!name || !email || !message) {
			return fail(400, { error: '請填寫所有欄位' });
		}
		
		if (!isValidEmail(email)) {
			return fail(400, { error: '信箱格式錯誤' });
		}
		
		try {
			// 處理表單提交
			await sendContactEmail({ name, email, message });
			
			return { success: true };
		} catch (error) {
			return fail(500, { error: '送出時發生錯誤' });
		}
	}
};

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 多個動作

```javascript
// src/routes/admin/users/+page.server.js
export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		// 建立用戶邏輯
		return { success: true, message: '用戶已建立' };
	},
	
	update: async ({ request }) => {
		const data = await request.formData();
		// 更新用戶邏輯
		return { success: true, message: '用戶已更新' };
	},
	
	delete: async ({ request }) => {
		const data = await request.formData();
		// 刪除用戶邏輯
		return { success: true, message: '用戶已刪除' };
	}
};
```

```svelte
<!-- src/routes/admin/users/+page.svelte -->
<form method="POST" action="?/create">
	<!-- 建立用戶表單 -->
	<button type="submit">建立用戶</button>
</form>

<form method="POST" action="?/update">
	<!-- 更新用戶表單 -->
	<button type="submit">更新用戶</button>
</form>

<form method="POST" action="?/delete">
	<input type="hidden" name="userId" value={user.id} />
	<button type="submit">刪除用戶</button>
</form>
```

---

## 7. API 路由與端點

### 基本 API 端點

```javascript
// src/routes/api/hello/+server.js
import { json } from '@sveltejs/kit';

export function GET() {
	return json({
		message: 'Hello from SvelteKit API!',
		timestamp: new Date().toISOString()
	});
}

export function POST({ request }) {
	// 處理 POST 請求
	return json({ received: true });
}
```

### RESTful API 設計

```javascript
// src/routes/api/posts/+server.js
import { json, error } from '@sveltejs/kit';

// GET /api/posts - 取得所有文章
export async function GET({ url }) {
	const page = url.searchParams.get('page') || 1;
	const limit = url.searchParams.get('limit') || 10;
	
	try {
		const posts = await getPosts({ page, limit });
		return json(posts);
	} catch (err) {
		throw error(500, '無法載入文章');
	}
}

// POST /api/posts - 建立新文章
export async function POST({ request, cookies }) {
	const token = cookies.get('auth-token');
	
	if (!token) {
		throw error(401, '未授權');
	}
	
	const data = await request.json();
	
	try {
		const newPost = await createPost(data);
		return json(newPost, { status: 201 });
	} catch (err) {
		throw error(400, '建立文章失敗');
	}
}
```

### 動態 API 路由

```javascript
// src/routes/api/posts/[id]/+server.js
import { json, error } from '@sveltejs/kit';

// GET /api/posts/123
export async function GET({ params }) {
	const { id } = params;
	
	try {
		const post = await getPostById(id);
		
		if (!post) {
			throw error(404, '文章不存在');
		}
		
		return json(post);
	} catch (err) {
		throw error(500, '載入文章失敗');
	}
}

// PUT /api/posts/123
export async function PUT({ params, request }) {
	const { id } = params;
	const updates = await request.json();
	
	try {
		const updatedPost = await updatePost(id, updates);
		return json(updatedPost);
	} catch (err) {
		throw error(400, '更新文章失敗');
	}
}

// DELETE /api/posts/123
export async function DELETE({ params }) {
	const { id } = params;
	
	try {
		await deletePost(id);
		return new Response(null, { status: 204 });
	} catch (err) {
		throw error(400, '刪除文章失敗');
	}
}
```

### 中介軟體與認證

```javascript
// src/routes/api/admin/+server.js
import { json, error } from '@sveltejs/kit';

async function requireAuth(cookies) {
	const token = cookies.get('auth-token');
	
	if (!token) {
		throw error(401, '需要登入');
	}
	
	const user = await verifyToken(token);
	
	if (!user || !user.isAdmin) {
		throw error(403, '權限不足');
	}
	
	return user;
}

export async function GET({ cookies }) {
	await requireAuth(cookies);
	
	// 管理員專用資料
	const adminData = await getAdminData();
	return json(adminData);
}
```

---

## 8. 錯誤處理

### 基本錯誤頁面

```svelte
<!-- src/routes/+error.svelte -->
<script>
	import { page } from '$app/stores';
	
	$: status = $page.status;
	$: message = $page.error?.message || '發生未知錯誤';
</script>

<svelte:head>
	<title>錯誤 {status}</title>
</svelte:head>

<main>
	<h1>糟糕！發生錯誤了</h1>
	
	{#if status === 404}
		<h2>頁面不存在</h2>
		<p>您要找的頁面可能已被移動或刪除。</p>
	{:else if status >= 500}
		<h2>伺服器錯誤</h2>
		<p>我們的伺服器遇到了問題，請稍後再試。</p>
	{:else}
		<h2>錯誤 {status}</h2>
		<p>{message}</p>
	{/if}
	
	<a href="/">回到首頁</a>
</main>

<style>
	main {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	h1 {
		color: #d32f2f;
	}
</style>
```

---

## 9. 環境變數與設定

### 環境變數設定

```bash
# .env
DATABASE_URL=postgresql://localhost:5432/myapp
API_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 存取環境變數

```javascript
// src/lib/config.js
import { env } from '$env/dynamic/private';

export const config = {
	database: {
		url: env.DATABASE_URL
	},
	api: {
		secret: env.API_SECRET
	}
};
```

---

## 10. 靜態資源處理

### 基本靜態檔案

```
static/
├── favicon.ico
├── robots.txt
├── images/
│   ├── logo.png
│   └── hero-bg.jpg
└── downloads/
    └── brochure.pdf
```

在組件中使用：

```svelte
<script>
	import { base } from '$app/paths';
</script>

<!-- 基本用法 -->
<img src="/images/logo.png" alt="Logo" />

<!-- 使用 base path（適用於子路徑部署） -->
<img src="{base}/images/logo.png" alt="Logo" />
```

---

## 11. 高級路由功能

### 路由群組

使用括號建立路由群組（不影響 URL）：

```
src/routes/
├── (marketing)/
│   ├── +layout.svelte    # 行銷頁面共用佈局
│   ├── about/
│   │   └── +page.svelte  # /about
│   └── contact/
│       └── +page.svelte  # /contact
└── (app)/
    ├── +layout.svelte    # 應用程式共用佈局
    ├── dashboard/
    │   └── +page.svelte  # /dashboard
    └── profile/
        └── +page.svelte  # /profile
```

---

## 12. 伺服器端渲染（SSR）

### 預設 SSR 行為

SvelteKit 預設啟用 SSR，所有頁面都會在伺服器端預渲染：

```svelte
<!-- 這個頁面會在伺服器端渲染 -->
<script>
	export let data;
	
	// 這段程式碼會在伺服器和客戶端都執行
	console.log('渲染頁面:', data.title);
</script>

<h1>{data.title}</h1>
```

### 停用 SSR

```javascript
// src/routes/admin/+page.js
export const ssr = false; // 這個頁面只在客戶端渲染
```

---

## 13. 預渲染與靜態網站

### 啟用預渲染

```javascript
// src/routes/blog/+page.js
export const prerender = true;

export async function load() {
	// 在建置時執行
	const posts = await getAllPosts();
	return { posts };
}
```

### 動態預渲染

```javascript
// src/routes/blog/[slug]/+page.js
export const prerender = true;

export async function entries() {
	// 返回所有要預渲染的路由
	const posts = await getAllPosts();
	return posts.map(post => ({ slug: post.slug }));
}
```

---

## 14. 狀態管理策略

### 使用 Stores

```javascript
// src/lib/stores/auth.js
import { writable } from 'svelte/store';

function createAuthStore() {
	const { subscribe, set, update } = writable({
		user: null,
		isAuthenticated: false
	});

	return {
		subscribe,
		login: (user) => set({ user, isAuthenticated: true }),
		logout: () => set({ user: null, isAuthenticated: false }),
		updateUser: (userData) => update(state => ({
			...state,
			user: { ...state.user, ...userData }
		}))
	};
}

export const auth = createAuthStore();
```

### 頁面層級狀態

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script>
	import { auth } from '$lib/stores/auth.js';
	export let data;
	
	$: if (data.user) {
		auth.login(data.user);
	}
</script>

{#if $auth.isAuthenticated}
	<h1>歡迎回來，{$auth.user.name}!</h1>
{/if}
```

---

## 15. SEO 與 Meta 標籤

### 動態 Meta 標籤

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
	export let data;
	$: post = data.post;
</script>

<svelte:head>
	<title>{post.title} - 我的部落格</title>
	<meta name="description" content={post.excerpt} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt} />
	<meta property="og:image" content={post.image} />
	<meta property="og:url" content="https://example.com/blog/{post.slug}" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={post.title} />
	<meta name="twitter:description" content={post.excerpt} />
</svelte:head>

<article>
	<h1>{post.title}</h1>
	<div>{@html post.content}</div>
</article>
```

---

## 16. 部署到各平台

### Vercel 部署

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter()
	}
};
```

### Netlify 部署

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-netlify';

export default {
	kit: {
		adapter: adapter()
	}
};
```

### 靜態部署

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		})
	}
};
```

---

## 17. 效能優化

### 程式碼分割

```svelte
<script>
	import { onMount } from 'svelte';
	
	let HeavyComponent;
	
	onMount(async () => {
		// 動態載入重型組件
		const module = await import('$lib/components/HeavyComponent.svelte');
		HeavyComponent = module.default;
	});
</script>

{#if HeavyComponent}
	<svelte:component this={HeavyComponent} />
{/if}
```

### 預載入策略

```javascript
// src/routes/+layout.js
export const load = async ({ url, fetch }) => {
	// 預載入關鍵資料
	if (url.pathname === '/') {
		const criticalData = await fetch('/api/critical').then(r => r.json());
		return { criticalData };
	}
	
	return {};
};
```

---

## 18. 測試策略

### 單元測試

```javascript
// tests/components/Button.test.js
import { render, fireEvent } from '@testing-library/svelte';
import Button from '$lib/components/Button.svelte';

test('按鈕點擊事件', async () => {
	const { getByRole } = render(Button, { text: '點我' });
	const button = getByRole('button');
	
	await fireEvent.click(button);
	// 驗證結果...
});
```

### 整合測試

```javascript
// tests/routes/api.test.js
import { expect, test } from 'vitest';

test('API 端點測試', async () => {
	const response = await fetch('/api/posts');
	expect(response.status).toBe(200);
	
	const data = await response.json();
	expect(Array.isArray(data)).toBe(true);
});
```

---

## 19. TypeScript 整合

### 基本設定

```typescript
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const { slug } = params;
	
	const response = await fetch(`/api/posts/${slug}`);
	const post: Post = await response.json();
	
	return {
		post
	};
};
```

### 型別定義

```typescript
// src/lib/types.ts
export interface Post {
	id: string;
	title: string;
	content: string;
	slug: string;
	published: boolean;
	createdAt: string;
}

export interface User {
	id: string;
	email: string;
	name: string;
	role: 'admin' | 'user';
}
```

---

## 20. 最佳實踐與常見問題

### 資料夾結構最佳實踐

```
src/
├── lib/
│   ├── components/        # 可重用組件
│   │   ├── ui/           # 基礎 UI 組件
│   │   └── forms/        # 表單組件
│   ├── stores/           # 全域狀態
│   ├── utils/            # 工具函式
│   └── types/            # TypeScript 型別
├── routes/               # 頁面路由
└── styles/               # 全域樣式
```

### 效能最佳實踐

1. **適當使用 SSR/SSG**：靜態內容使用預渲染
2. **程式碼分割**：按需載入大型組件
3. **快取策略**：適當設定 HTTP 快取標頭
4. **圖片優化**：使用 WebP 格式和延遲載入

### 常見問題解決

**問題：Hydration 不匹配**
```javascript
// 解決方案：使用 browser 檢查
import { browser } from '$app/environment';

let clientOnlyData;
if (browser) {
	clientOnlyData = getClientData();
}
```

**問題：環境變數未載入**
```bash
# 確保變數名以 PUBLIC_ 開頭（客戶端使用）
PUBLIC_API_URL=https://api.example.com
```

---

## 🎯 學習建議

### 初學者路線
1. 掌握路由系統和頁面建立
2. 學會資料載入和表單處理
3. 理解 SSR 和客戶端渲染差異
4. 練習 API 開發

### 進階路線
1. 深入學習效能優化技巧
2. 掌握部署和 CI/CD 流程
3. 學習進階路由功能
4. 探索伺服器端功能

### 實戰專案建議
1. **部落格系統** - 練習內容管理和 SEO
2. **電商網站** - 學習複雜狀態管理
3. **Dashboard** - 練習資料視覺化
4. **API 服務** - 學習後端開發

### 有用資源
- [SvelteKit 官方文檔](https://kit.svelte.dev/)
- [SvelteKit 範例](https://github.com/sveltejs/kit/tree/master/examples)
- [SvelteKit Discord](https://discord.gg/svelte)

---

## 🚀 快速參考

### 檔案命名規則
```
+page.svelte         # 頁面組件
+page.js            # 頁面載入邏輯
+page.server.js     # 伺服器端載入邏輯
+layout.svelte      # 佈局組件
+layout.js          # 佈局載入邏輯
+error.svelte       # 錯誤頁面
+server.js          # API 端點
```

### 常用導入
```javascript
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { browser } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';
```

恭喜您完成 SvelteKit 完整學習指南！現在您已經具備了建立現代化 Web 應用程式的技能。多練習實際專案，Happy coding! 🎉

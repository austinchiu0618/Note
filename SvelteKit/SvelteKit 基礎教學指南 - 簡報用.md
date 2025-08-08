# SvelteKit 基礎教學指南

## 目錄
1. [SvelteKit 簡介](#sveltekit-簡介)
2. [環境建置](#環境建置)
3. [專案結構](#專案結構)
4. [路由系統](#路由系統)
5. [頁面與佈局](#頁面與佈局)
6. [資料載入](#資料載入)
7. [表單處理](#表單處理)
8. [API 路由](#api-路由)
9. [部署](#部署)
10. [進階功能](#進階功能)

---

## SvelteKit 簡介

### 什麼是 SvelteKit？
SvelteKit 是基於 Svelte 的全端 Web 應用程式框架，提供：
- **檔案式路由系統** - 基於檔案結構自動生成路由
- **伺服器端渲染 (SSR)** - 更好的 SEO 和首屏載入速度
- **靜態站點生成 (SSG)** - 可生成靜態網站
- **API 路由** - 建立後端 API
- **預設最佳化** - 代碼分割、預載入等

### SvelteKit vs 其他框架

| 特性 | SvelteKit | Next.js | Nuxt.js |
|------|-----------|---------|---------|
| 基於框架 | Svelte | React | Vue |
| 檔案大小 | 極小 | 中等 | 中等 |
| 學習曲線 | 平緩 | 中等 | 中等 |
| 效能 | 極佳 | 優秀 | 優秀 |

---

## 環境建置

### 1. 系統要求
- Node.js 16+ 
- npm, yarn, 或 pnpm

### 2. 建立新專案

```bash
# 使用官方範本
npm create sveltekit@latest my-app

# 進入專案目錄
cd my-app

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 3. 專案選項說明
建立專案時會有以下選項：
- **Which Svelte app template?**
  - Skeleton project (推薦新手)
  - Demo app (有範例)
  - Library skeleton (建立套件)

- **Add type checking with TypeScript?**
  - Yes, using JavaScript with JSDoc comments
  - Yes, using TypeScript syntax
  - No

- **Select additional options:**
  - ESLint (程式碼檢查)
  - Prettier (程式碼格式化)
  - Playwright (端對端測試)
  - Vitest (單元測試)

---

## 專案結構

```
my-app/
├── src/
│   ├── app.html          # HTML 範本
│   ├── app.css           # 全域樣式
│   ├── routes/           # 路由目錄
│   │   ├── +layout.svelte    # 根佈局
│   │   ├── +page.svelte      # 首頁
│   │   └── about/
│   │       └── +page.svelte  # 關於頁面
│   └── lib/              # 共用元件和工具
├── static/               # 靜態檔案
├── package.json
├── svelte.config.js      # SvelteKit 設定
└── vite.config.js        # Vite 設定
```

### 重要檔案說明

**src/app.html** - HTML 範本
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

---

## 路由系統

### 基本路由概念
SvelteKit 使用**檔案式路由**，檔案結構直接對應 URL：

```
src/routes/
├── +page.svelte           # / (首頁)
├── +error.svelte
├── about/
│   └── +page.svelte       # /about
├── blog/
│   ├── +page.svelte       # /blog
│   └── [slug]/
│       └── +page.svelte   # /blog/[動態參數]
└── admin/
    └── users/
        ├── +page.svelte   # /admin/users
        ├── +page.js
        ├── +page.server.js
        ├── +layout.svelte
        ├── +layout.js
        └── +layout.server.js  

```

### 特殊檔案命名

| 檔案名稱 | 用途 |
|----------|------|
| `+page.svelte` | 頁面元件 |
| `+layout.svelte` | 佈局元件 |
| `+page.js/ts` | 頁面載入函數 |
| `+layout.js/ts` | 佈局載入函數 |
| `+page.server.js/ts` | 伺服器端頁面載入 |
| `+layout.server.js/ts` | 伺服器端佈局載入 |
| `+error.svelte` | 錯誤頁面 |

### 動態路由

**基本動態路由：`[slug]`**
```
src/routes/blog/[slug]/+page.svelte
```

訪問 `/blog/hello-world` 時，`slug` 參數值為 `"hello-world"`

**可選參數：`[[param]]`**
```
src/routes/blog/[[category]]/+page.svelte
```

同時匹配 `/blog` 和 `/blog/tech`

**Rest 參數：`[...rest]`**
```
src/routes/docs/[...path]/+page.svelte
```

匹配 `/docs/a/b/c`，`path` 為 `"a/b/c"`

### 路由參數取得

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
  import { page } from '$app/stores';
  
  // 取得路由參數
  $: slug = $page.params.slug;
  
  // 取得查詢參數
  $: searchParams = $page.url.searchParams;
</script>

<h1>文章：{slug}</h1>
<p>查詢參數：{searchParams.get('q')}</p>
```

---

## 頁面與佈局

### 基本頁面

```svelte
<!-- src/routes/+page.svelte -->
<script>
  let name = 'SvelteKit';
</script>

<svelte:head>
  <title>首頁</title>
  <meta name="description" content="SvelteKit 首頁" />
</svelte:head>

<h1>歡迎來到 {name}!</h1>
<p>這是我的第一個 SvelteKit 應用程式。</p>
```

### 佈局系統

**根佈局：`src/routes/+layout.svelte`**
```svelte
<script>
  import '../app.css';

  let { children } = $props()
</script>

<header>
  <nav>
    <a href="/">首頁</a>
    <a href="/about">關於</a>
    <a href="/blog">部落格</a>
  </nav>
</header>

<main>
  <slot />

  {@render children?.()}
</main>

<footer>
  <p>&copy; 2024 我的網站</p>
</footer>

<style>
  header {
    background: #333;
    color: white;
    padding: 1rem;
  }
  
  nav a {
    color: white;
    text-decoration: none;
    margin-right: 1rem;
  }
  
  main {
    min-height: calc(100vh - 120px);
    padding: 1rem;
  }
</style>
```

**巢狀佈局**
```
src/routes/
├── +layout.svelte          # 根佈局
├── admin/
│   ├── +layout.svelte      # 管理後台佈局
│   ├── +page.svelte        # /admin
│   └── users/
│       └── +page.svelte    # /admin/users (繼承兩層佈局)
```

### 條件佈局

**佈局群組：`(group)`**
```
src/routes/
├── +layout.svelte
├── (marketing)/
│   ├── +layout.svelte      # 只對行銷頁面的佈局
│   ├── about/
│   │   └── +page.svelte    # 使用行銷佈局
│   └── contact/
│       └── +page.svelte    # 使用行銷佈局
└── admin/
    └── +page.svelte        # 只使用根佈局
```

---

## 資料載入

### 頁面載入函數

**基本載入：`+page.js`**
- 伺服器端執行（第一次進入網站時）
- 客戶端執行（在網站內部導航時）
```javascript
// src/routes/blog/+page.js
export async function load() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const posts = await response.json();
  
  return {
    posts
  };
}
```

**在頁面中使用：**
```svelte
<!-- src/routes/blog/+page.svelte -->
<script>
  // Svelte 4
  export let data;

  // Svelte 5
  let { data } = $props()
</script>

<h1>部落格文章</h1>
{#each data.posts as post}
  <article>
    <h2>{post.title}</h2>
    <p>{post.body}</p>
  </article>
{/each}
```

### 伺服器端載入

**`+page.server.js` - 只在伺服器執行**
```javascript
// src/routes/profile/+page.server.js
import { error } from '@sveltejs/kit';

export async function load({ cookies }) {
  // 檢查用戶是否登入
  const sessionId = cookies.get('session');
  
  if (!sessionId) {
    throw error(401, '請先登入');
  }
  
  const user = await getUserFromSession(sessionId);
  
  return {
    user
  };
}
```

### 載入函數參數

```javascript
export async function load({ 
  params,      // 路由參數
  url,         // URL 物件
  cookies,     // Cookie 操作
  fetch,       // 增強的 fetch 函數
  parent,      // 父層載入資料
  depends      // 依賴追蹤
}) {
  // 載入邏輯
}
```

### 佈局載入

```javascript
// src/routes/+layout.js
export async function load() {
  return {
    siteName: 'My SvelteKit Site',
    user: await getCurrentUser()
  };
}
```

子頁面可以透過 `parent()` 取得：
```javascript
// src/routes/blog/+page.js
export async function load({ parent }) {
  const { user } = await parent();
  
  return {
    user,
    posts: await getBlogPosts()
  };
}
```

---

## 表單處理

### 基本表單

```svelte
<!-- src/routes/contact/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  
  export let form; // 自動接收後端回傳的資料

  // 完全自訂表單行為
  function customEnhance({ formElement, formData, action, cancel, submitter }) {
    // 送出前：可以修改資料、顯示載入動畫
    console.log('表單即將送出...');
    
    return async ({ result, update }) => {
      // 送出後：自訂成功/失敗處理
      if (result.type === 'success') {
        showToast('成功！');
      }
      
      // 呼叫預設更新行為
      await update();
    };
  }
</script>

<form method="POST" use:enhance={customEnhance}>
  <!-- 使用 use:enhance 後 -->

  <!-- ✨ 不會重新整理頁面 -->
  <!-- ⚡ 自動載入狀態管理 -->
  <!-- 🔄 自動錯誤處理 -->
  <!-- 📝 保持表單輸入狀態 -->
  <!-- 🎯 自動跳轉處理 -->
  <label>
    姓名：
    <input name="name" type="text" required />
  </label>
  
  <label>
    信箱：
    <input name="email" type="email" required />
  </label>
  
  <button type="submit">送出</button>
</form>

{#if form?.success}
  <p class="success">訊息已送出！</p>
{/if}

{#if form?.errors}
  <ul class="errors">
    {#each Object.entries(form.errors) as [field, message]}
      <li>{field}: {message}</li>
    {/each}
  </ul>
{/if}
```

### 表單動作
```javascript
// src/routes/contact/+page.server.js
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name');
    const email = data.get('email');
    
    // 驗證
    const errors = {};
    if (!name || name.length < 2) {
      errors.name = '姓名至少需要 2 個字元';
    }
    if (!email || !email.includes('@')) {
      errors.email = '請輸入有效的信箱';
    }
    
    if (Object.keys(errors).length > 0) {
      return fail(400, { errors });
    }
    
    // 處理表單資料
    await sendContactEmail({ name, email, message });
    
    return { success: true };
  }
};
```

## API 路由

- 內部呼叫優化：當你在 load 函數中呼叫自己的 API 時，SvelteKit 會直接執行函數，不會真的發 HTTP 請求
- 自動帶上身份驗證：用戶的 cookies 和登入狀態會自動傳遞
- 相對路徑支援：可以使用 /api/todoList 而不需要完整 URL

```
傳統方式：
前端專案 → HTTP 請求 → 後端專案
(localhost:3000)      (localhost:8000)

SvelteKit：
同一個專案內的直接函數呼叫 ⚡
```

### 建立 API 端點

```javascript
// src/routes/api/todoList/+server.js
import { json } from '@sveltejs/kit';

export async function GET() {
  const todoList = await getTodoList();
  return json(todoList);
}

export async function POST({ request }) {
  const body = await request.json();
  const newTodo = await createTodo(body);
  return json(newTode, { status: 201 });
}
```

### 動態 API 路由

```javascript
// src/routes/api/todoList/[id]/+server.js
import { json, error } from '@sveltejs/kit';

export async function GET({ params }) {
  const todo = await getTodoList(params.id);
  
  if (!todo) {
    throw error(404, 'Todo not found');
  }
  
  return json(todo);
}

export async function PUT({ params, request }) {
  const body = await request.json();
  const updatedTodo = await updateTodo(params.id, body);
  return json(updatedTodo);
}

export async function DELETE({ params }) {
  await deleteTodo(params.id);
  return new Response(null, { status: 204 });
}
```

### API 使用範例

```svelte
<!-- 在頁面中使用 API -->
<script>
  import { onMount } from 'svelte';
  
  let todoList = [];
  
  onMount(async () => {
    const response = await fetch('/api/todoList');
    todoList = await response.json();
  });
  
  async function createTodo(todoData) {
    const response = await fetch('/api/todoList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todoData)
    });
    
    if (response.ok) {
      const newTodo = await response.json();
      todoList = [...todoList, newTodo];
    }
  }
</script>
```

---

## 進階功能

### 1. 環境變數

**`.env` 檔案：**
```
# 私有變數 (只在伺服器端可用)
DATABASE_URL=postgresql://...
SECRET_KEY=secret123

# 公開變數 (需要前綴 PUBLIC_)
PUBLIC_API_URL=https://api.example.com
```

**使用方式：**
```javascript
import { env } from '$env/dynamic/private';
import { PUBLIC_API_URL } from '$env/static/public';

// 伺服器端
const databaseUrl = env.DATABASE_URL;

// 客戶端和伺服器端都可用
const apiUrl = PUBLIC_API_URL;
```

### 2. 預載入策略

```javascript
// src/routes/+layout.js
export const prerender = true; // 預渲染
export const ssr = false;      // 關閉 SSR
export const csr = true;       // 啟用客戶端渲染
```

### 3. 錯誤處理

```svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<h1>Oops!</h1>
<p>發生錯誤：{$page.error.message}</p>
<p>狀態碼：{$page.status}</p>
```

### 4. Hooks

門神功能：決定誰可以進入哪些頁面
自動化工作：每個請求都自動執行一些檢查或處理
錯誤處理：當出錯時優雅地處理
安全防護：自動加上各種安全措施
記錄追蹤：記錄用戶行為或系統狀況

```
src/
├── hooks.server.js    # 只在「伺服器」執行的守衛
├── hooks.client.js    # 只在「瀏覽器」執行的守衛  
└── hooks.js          # 兩邊都執行的守衛
```

**src/hooks.server.js - 伺服器端 hooks**
```javascript
export async function handle({ event, resolve }) {
  // 在每個請求前執行
  console.log(`${event.request.method} ${event.url.pathname}`);
  
  const response = await resolve(event);
  return response;
}

export function handleError({ error, event }) {
  console.error('錯誤:', error);
  
  return {
    message: '發生內部錯誤'
  };
}
```

---

## 參考資源

- [SvelteKit 官方文件](https://kit.svelte.dev/)
- [Svelte 官方教學](https://svelte.dev/tutorial)
- [SvelteKit 範例](https://github.com/sveltejs/kit/tree/master/examples)
- [社群範本](https://github.com/svelte-add/svelte-add)

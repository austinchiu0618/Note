## 🚨 什麼是 Errors？

在 `load` 函數中發生錯誤時，SvelteKit 會自動顯示錯誤頁面，讓用戶知道發生了什麼問題。

## 🎯 錯誤處理的基本概念

### 1. **預期的錯誤 (Expected Errors)**
使用 `error()` 函數主動拋出的錯誤，通常是業務邏輯錯誤：

````javascript
import { error } from '@sveltejs/kit';

export function load({ params }) {
    if (params.slug === 'secret') {
        error(403, '無權限訪問');
    }
    
    if (!findPost(params.slug)) {
        error(404, '文章不存在');
    }
}
````

### 2. **意外的錯誤 (Unexpected Errors)**
程式本身的錯誤，如網路問題、資料庫連線失敗等：

````javascript
export async function load() {
    try {
        const data = await database.getPosts();
        return { posts: data };
    } catch (err) {
        // 這會被當作 500 錯誤處理
        throw err;
    }
}
````

## 📁 錯誤頁面結構

```
📁 src/routes/
├── +error.svelte          → 根層級錯誤頁面
├── blog/
│   ├── +error.svelte      → 部落格區域錯誤頁面
│   └── [slug]/
│       └── +page.js       → 可能拋出錯誤的地方
```

### 錯誤頁面範例
````svelte
<!-- +error.svelte -->
<script>
    import { page } from '$app/stores';
</script>

<h1>錯誤 {$page.status}</h1>
<p>{$page.error.message}</p>

{#if $page.status === 404}
    <p>找不到您要的頁面</p>
    <a href="/">回到首頁</a>
{:else if $page.status === 403}
    <p>您沒有權限訪問此頁面</p>
    <a href="/login">登入</a>
{:else}
    <p>伺服器發生錯誤，請稍後再試</p>
{/if}
````

## 🔧 實際應用範例

### 1. **權限檢查**
````javascript
// src/routes/admin/+layout.server.js
import { error } from '@sveltejs/kit';

export function load({ locals }) {
    if (!locals.user) {
        error(401, '請先登入');
    }
    
    if (!locals.user.isAdmin) {
        error(403, '需要管理員權限');
    }
    
    return {
        user: locals.user
    };
}
````

### 2. **資料驗證**
````javascript
// src/routes/blog/[slug]/+page.server.js
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const post = await getPost(params.slug);
    
    if (!post) {
        error(404, '文章不存在');
    }
    
    if (post.status === 'draft' && !user.isAdmin) {
        error(403, '草稿文章僅限管理員查看');
    }
    
    return { post };
}
````

### 3. **API 錯誤處理**
````javascript
// src/routes/api/posts/+server.js
import { error, json } from '@sveltejs/kit';

export async function GET({ url }) {
    const limit = url.searchParams.get('limit');
    
    if (limit && isNaN(Number(limit))) {
        error(400, 'limit 參數必須是數字');
    }
    
    try {
        const posts = await database.getPosts(Number(limit));
        return json(posts);
    } catch (err) {
        error(500, '無法獲取文章列表');
    }
}
````

## 🎨 錯誤頁面設計技巧

### 基本錯誤頁面
````svelte
<!-- src/routes/+error.svelte -->
<script>
    import { page } from '$app/stores';
    
    $: status = $page.status;
    $: message = $page.error?.message || '發生未知錯誤';
</script>

<div class="error-container">
    <h1>{status}</h1>
    <p>{message}</p>
    
    {#if status === 404}
        <div class="not-found">
            <h2>頁面不存在</h2>
            <p>您要找的頁面可能已經移動或刪除</p>
            <a href="/">回到首頁</a>
        </div>
    {:else if status >= 500}
        <div class="server-error">
            <h2>伺服器錯誤</h2>
            <p>我們正在修復這個問題，請稍後再試</p>
            <button on:click={() => location.reload()}>
                重新整理
            </button>
        </div>
    {:else}
        <div class="client-error">
            <h2>請求錯誤</h2>
            <p>請檢查您的輸入或權限</p>
            <a href="/">回到首頁</a>
        </div>
    {/if}
</div>

<style>
    .error-container {
        text-align: center;
        padding: 2rem;
        max-width: 600px;
        margin: 0 auto;
    }
    
    h1 {
        font-size: 4rem;
        color: #ff3e00;
        margin-bottom: 1rem;
    }
</style>
````

### 巢狀錯誤頁面
````svelte
<!-- src/routes/blog/+error.svelte -->
<script>
    import { page } from '$app/stores';
</script>

<div class="blog-error">
    <h1>部落格錯誤</h1>
    
    {#if $page.status === 404}
        <p>找不到這篇文章</p>
        <a href="/blog">瀏覽所有文章</a>
    {:else}
        <p>{$page.error.message}</p>
        <a href="/blog">回到部落格</a>
    {/if}
</div>
````

## 🔄 錯誤處理流程圖

```
用戶訪問 /admin/secret
      ↓
🖥️ 執行 +layout.server.js
      ↓
🔍 檢查 locals.user
      ↓
❌ 沒有登入
      ↓
🚨 error(401, '請先登入')
      ↓
🔍 尋找最近的 +error.svelte
      ↓
📄 渲染錯誤頁面
      ↓
🌐 顯示「錯誤 401: 請先登入」
```

## 💡 實用技巧

### 1. **錯誤重導向**
````javascript
import { error, redirect } from '@sveltejs/kit';

export function load({ locals, url }) {
    if (!locals.user) {
        // 不拋出錯誤，而是重導向到登入頁
        redirect(302, `/login?redirect=${url.pathname}`);
    }
}
````

### 2. **錯誤回復**
````javascript
export async function load({ params }) {
    try {
        const post = await getPost(params.slug);
        return { post };
    } catch (err) {
        // 提供備用方案
        console.error('無法獲取文章:', err);
        error(404, '文章暫時無法載入');
    }
}
````

### 3. **開發模式詳細錯誤**
````javascript
import { dev } from '$app/environment';

export function load() {
    try {
        // 一些可能失敗的操作
    } catch (err) {
        const message = dev 
            ? `開發錯誤: ${err.message}` 
            : '伺服器錯誤';
        error(500, message);
    }
}
````

## 🎯 總結

**SvelteKit 錯誤處理的核心**：
- 🚨 **預期錯誤**：使用 `error()` 主動拋出
- 💥 **意外錯誤**：自動捕獲並顯示
- 📄 **錯誤頁面**：`+error.svelte` 顯示友善錯誤
- 🎯 **錯誤層級**：就近處理，向上冒泡

**最佳實務**：
- 權限檢查時拋出 401/403
- 資料不存在時拋出 404
- 伺服器問題時拋出 500
- 提供清楚的錯誤訊息
- 設計友善的錯誤頁面

記住：好的錯誤處理讓用戶知道發生什麼事，並提供解決方案！
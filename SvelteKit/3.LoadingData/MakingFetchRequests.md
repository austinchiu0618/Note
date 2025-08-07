## 🌐 SvelteKit 的 fetch 是什麼？

SvelteKit 提供了一個**增強版的 fetch**，它比瀏覽器原生的 fetch 更聰明！

## 🆚 普通 fetch vs SvelteKit fetch

### 普通瀏覽器 fetch
````javascript
// 只能在瀏覽器中使用
const response = await fetch('https://api.example.com/posts');
const data = await response.json();
````

### SvelteKit 增強 fetch
````javascript
// 在 load 函數中使用
export async function load({ fetch }) {
    // 這個 fetch 有超能力！
    const response = await fetch('/api/posts');
    const data = await response.json();
    return { posts: data };
}
````

## ✨ SvelteKit fetch 的超能力

### 1. **自動帶上身份驗證**
```
🍪 用戶的 cookies 和登入狀態會自動傳遞

用戶請求頁面時帶著：
├── Cookie: session=abc123
└── Authorization: Bearer token

SvelteKit fetch 會自動帶上這些資訊！
```

### 2. **相對路徑支援**
````javascript
// ✅ 在伺服器端也能用相對路徑
const response = await fetch('/api/posts');  // 自動變成完整 URL

// ❌ 普通 fetch 在伺服器端需要完整 URL
const response = await fetch('https://mysite.com/api/posts');
````

### 3. **內部 API 直接呼叫**
```
🚀 效能優化：直接呼叫而不走網路

當你呼叫自己的 API：
fetch('/api/posts') 
      ↓
不會真的發 HTTP 請求！
      ↓
直接執行 +server.js 裡的函數
      ↓
超快！
```

### 4. **資料預載入 (最重要！)**
```
🎯 防止重複請求的魔法

伺服器端：
├── fetch('/api/posts') → 取得資料
├── 把資料嵌入到 HTML 中
└── 傳送給瀏覽器

瀏覽器端：
├── 不需要重新 fetch
├── 直接從 HTML 讀取資料
└── 節省網路請求！
```

## 📊 實際範例比較

### ❌ 錯誤做法 - 使用普通 fetch
````javascript
// +page.svelte
<script>
    import { onMount } from 'svelte';
    
    let posts = [];
    
    onMount(async () => {
        // 問題：會造成重複請求
        const response = await fetch('/api/posts');
        posts = await response.json();
    });
</script>
````

**問題**：
- 伺服器端渲染時取一次資料
- 瀏覽器端又取一次資料
- 浪費！用戶會看到載入閃爍

### ✅ 正確做法 - 使用 SvelteKit fetch
````javascript
// +page.js
export async function load({ fetch }) {
    const response = await fetch('/api/posts');
    const posts = await response.json();
    
    return {
        posts
    };
}
````

````svelte
<!-- +page.svelte -->
<script>
    let { data } = $props();
</script>

{#each data.posts as post}
    <article>{post.title}</article>
{/each}
````

**優點**：
- 只取一次資料
- 資料直接嵌入 HTML
- 用戶立即看到內容

## 🔄 完整流程圖

```
用戶訪問 /blog
      ↓
🖥️ 伺服器執行 load 函數
      ↓
📡 fetch('/api/posts') 
      ↓
🗄️ 取得部落格文章資料
      ↓
🎨 渲染成完整 HTML：
   <article>文章1</article>
   <article>文章2</article>
   <script>
     // 把資料嵌入這裡
     window.__sveltekit_data = { posts: [...] }
   </script>
      ↓
📤 傳送給瀏覽器
      ↓
🌐 瀏覽器收到已經有內容的頁面
      ↓
⚡ Hydration：JavaScript 從嵌入的資料恢復狀態
```

## 💡 實用技巧

### 呼叫外部 API
````javascript
export async function load({ fetch }) {
    // 外部 API - 會真的發 HTTP 請求
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    return {
        posts: await response.json()
    };
}
````

### 呼叫自己的 API
````javascript
export async function load({ fetch }) {
    // 內部 API - 直接呼叫函數，超快！
    const response = await fetch('/api/posts');
    return {
        posts: await response.json()
    };
}
````

### 帶上參數
````javascript
export async function load({ fetch, params }) {
    const response = await fetch(`/api/posts/${params.id}`);
    return {
        post: await response.json()
    };
}
````

## 🎯 總結

**SvelteKit fetch = 普通 fetch + 超能力**

- 🍪 自動帶身份驗證
- 🔗 支援相對路徑  
- ⚡ 內部 API 直接呼叫
- 🚫 防止重複請求
- 🎨 資料預載入到 HTML

**記住**：在 load 函數中一定要用 SvelteKit 提供的 `fetch`，不要用全域的 `fetch`！
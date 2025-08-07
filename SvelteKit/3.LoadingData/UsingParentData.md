## 🔗 什麼是 Parent Data？

Parent Data 就是讓子頁面能夠取得父級 layout 資料的功能，就像「家族傳承」一樣！

## 🏠 家族資料繼承圖解

```
📁 src/routes/
├── +layout.js           → 爺爺 { a: 1 }
├── abc/
│   ├── +layout.js       → 爸爸 { b: 2 } (可以拿爺爺的 a)
│   └── +page.js         → 兒子 { c: 3 } (可以拿爺爸的 a, b)
```

## 🎯 實際範例

### 1. **根 Layout (爺爺)**
````javascript
// src/routes/+layout.js
export function load() {
    return { 
        siteName: "我的網站",
        theme: "dark" 
    };
}
````

### 2. **子 Layout (爸爸)**
````javascript
// src/routes/blog/+layout.js
export async function load({ parent }) {
    const parentData = await parent(); // 拿到爺爺的資料
    
    return {
        ...parentData,  // 繼承 siteName, theme
        blogTitle: "部落格",
        posts: await getPosts()
    };
}
````

### 3. **頁面 (兒子)**
````javascript
// src/routes/blog/[slug]/+page.js
export async function load({ parent, params }) {
    const parentData = await parent(); // 拿到爸爸 + 爺爺的資料
    
    return {
        ...parentData,  // 繼承所有上層資料
        post: await getPost(params.slug)
    };
}
````

### 4. **在組件中使用**
````svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
    let { data } = $props();
</script>

<h1>{data.siteName}</h1>          <!-- 來自爺爺 -->
<h2>{data.blogTitle}</h2>         <!-- 來自爸爸 -->
<article>{data.post.title}</article> <!-- 來自兒子 -->

<!-- 最終 data 包含：
{
  siteName: "我的網站",    // 爺爺
  theme: "dark",          // 爺爺  
  blogTitle: "部落格",    // 爸爸
  posts: [...],           // 爸爸
  post: { title: "..." }  // 兒子
}
-->
````

## 🚀 實用應用場景

### 場景 1：用戶資訊繼承
````javascript
// +layout.server.js (根層級)
export async function load({ cookies }) {
    const user = await getUser(cookies.get('session'));
    return { user };
}

// blog/+page.js
export async function load({ parent }) {
    const { user } = await parent();
    
    // 根據用戶權限決定顯示什麼文章
    const posts = await getPosts(user.role);
    
    return { posts };
}
````

### 場景 2：SEO 資訊合併
````javascript
// +layout.js
export function load() {
    return {
        seo: {
            siteName: "我的網站",
            defaultTitle: "首頁"
        }
    };
}

// blog/[slug]/+page.js  
export async function load({ parent, params }) {
    const { seo } = await parent();
    const post = await getPost(params.slug);
    
    return {
        post,
        seo: {
            ...seo,
            title: `${post.title} - ${seo.siteName}`,
            description: post.excerpt
        }
    };
}
````

## ⚠️ 重要注意事項

### 1. **避免瀑布流 (Waterfall)**
````javascript
// ❌ 錯誤：序列執行，很慢
export async function load({ params, parent }) {
    const parentData = await parent();    // 等待
    const data = await getData(params);   // 再等待
    
    return { ...parentData, ...data };
}

// ✅ 正確：平行執行，很快
export async function load({ params, parent }) {
    const dataPromise = getData(params);     // 立即開始
    const parentData = await parent();       // 等待父級資料
    const data = await dataPromise;          // 等待自己的資料
    
    return { ...parentData, ...data };
}
````

### 2. **資料覆蓋規則**
```
如果有相同的 key，後面的會覆蓋前面的：

爺爺：{ name: "site", color: "blue" }
爸爸：{ name: "blog", size: "large" }  
結果：{ name: "blog", color: "blue", size: "large" }
     ↑ 爸爸覆蓋了爺爺的 name
```

### 3. **Server vs Universal Load**
````javascript
// +layout.server.js
export function load() {
    return { serverData: "secret" };
}

// +layout.js (Universal)
export async function load({ parent }) {
    const data = await parent(); // 可以拿到 serverData
    return { ...data, clientData: "public" };
}

// +page.js
export async function load({ parent }) {
    const data = await parent(); // 拿到合併的資料
    // data = { serverData: "secret", clientData: "public" }
}
````

## 💡 實用技巧

### 選擇性繼承
````javascript
export async function load({ parent }) {
    const parentData = await parent();
    
    // 只要特定的資料
    const { user, theme } = parentData;
    
    return {
        user,
        theme,
        pageSpecificData: "..."
    };
}
````

### 資料轉換
````javascript
export async function load({ parent }) {
    const { posts } = await parent();
    
    return {
        // 轉換父級資料
        featuredPosts: posts.filter(post => post.featured),
        postCount: posts.length
    };
}
````

## 🎯 總結

**Parent Data 的核心概念**：
- 🔗 **繼承**：子級可以取得父級的所有資料
- ⚡ **效能**：避免瀑布流，平行處理
- 🎭 **覆蓋**：相同 key 的資料會被覆蓋
- 🔄 **合併**：父子資料會自動合併

**何時使用**：
- 需要用戶資訊時
- SEO 資料繼承時
- 全域設定傳遞時
- 權限檢查時

記住：`await parent()` 就像問爸媽要零用錢一樣，先拿到家裡的資源，再加上自己的！
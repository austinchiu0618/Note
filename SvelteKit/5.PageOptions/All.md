## 🎯 PageOptions 頁面選項概述

SvelteKit 提供了強大的頁面選項系統，讓您可以精細控制每個頁面的渲染行為。預設情況下，SvelteKit 會：

1. **服務端渲染 (SSR)**：先在服務端生成 HTML
2. **發送到客戶端**：將 HTML 傳送給瀏覽器
3. **水合 (Hydration)**：在瀏覽器中重新渲染使其具有交互性
4. **路由器接管**：後續導航由客戶端路由器處理

## 📁 頁面選項的設定位置

您可以在以下檔案中設定頁面選項：

```
src/routes/
├── +page.js              # 單一頁面選項
├── +page.server.js       # 服務端頁面選項
├── +layout.js            # 布局選項（影響子頁面）
├── +layout.server.js     # 服務端布局選項
└── +server.js           # API 路由選項
```

### 選項繼承規則
- **子頁面會覆蓋父布局**的設定
- **根布局**可以設定整個應用的預設值
- **頁面選項**優先級最高

---

## 🚀 預渲染 (Prerender)

### 什麼是預渲染？
預渲染是在**構建時**生成靜態 HTML 檔案，適合內容不常變動的頁面。

### 基本用法

````javascript
export const prerender = true;
````

### 全站預渲染

````javascript
// 預設預渲染所有頁面
export const prerender = true;
````

````javascript
// 排除特定頁面
export const prerender = false;
````

### 自動模式

````javascript
export const prerender = 'auto';
````

**`auto` 模式的優點**：
- 可預渲染的頁面會被預渲染
- 無法預渲染的頁面會使用 SSR
- 頁面仍會包含在動態渲染清單中

### 預渲染服務端路由

````javascript
export const prerender = true;

export async function GET() {
  const posts = await getPosts();
  return new Response(JSON.stringify(posts));
}
````

### 動態路由的 entries

當預渲染器無法自動發現動態路由時，需要手動指定：

````javascript
/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  const posts = await getPosts();
  
  return posts.map(post => ({
    slug: post.slug
  }));
}

export const prerender = true;
````

### 何時不要預渲染

❌ **不適合預渲染的情況**：
- 需要個人化內容的頁面
- 需要存取 `url.searchParams` 的頁面
- 包含表單 actions 的頁面
- 需要即時資料的頁面

✅ **適合預渲染的情況**：
- 靜態內容頁面（關於我們、條款等）
- 部落格文章
- 產品展示頁面
- 文件頁面

---

## 🖥️ 服務端渲染 (SSR)

### 控制 SSR

````javascript
export const ssr = false;
````

### 什麼時候禁用 SSR？

❌ **需要禁用 SSR 的情況**：
- 使用瀏覽器專用 API（如 `document`、`window`）
- 純客戶端應用程式
- 需要即時用戶互動的頁面

### SPA 模式

````javascript
// 整個應用變成 SPA
export const ssr = false;
````

---

## 💻 客戶端渲染 (CSR)

### 控制 CSR

````javascript
export const csr = false;
````

### 禁用 CSR 的影響

當 `csr = false` 時：
- **不會發送 JavaScript** 到客戶端
- 所有 `<script>` 標籤被移除
- 表單無法進行漸進式增強
- 連結由瀏覽器處理（全頁面導航）
- 禁用熱模組替換 (HMR)

### 開發環境例外

````javascript
import { dev } from '$app/environment';

export const csr = dev; // 只在開發環境啟用 CSR
````

---

## 🔗 尾部斜線 (TrailingSlash)

### 控制 URL 格式

````javascript
export const trailingSlash = 'always';
// 選項：'never'（預設）、'always'、'ignore'
````

### 行為差異

| 設定 | `/about` 訪問 | `/about/` 訪問 | 預渲染檔案 |
|------|---------------|----------------|------------|
| `'never'` | 正常顯示 | 重定向到 `/about` | `about.html` |
| `'always'` | 重定向到 `/about/` | 正常顯示 | `about/index.html` |
| `'ignore'` | 兩者都正常 | 兩者都正常 | 依情況而定 |

### 注意事項

❌ **不建議使用 `'ignore'`**：
- `/x` 和 `/x/` 被視為不同 URL
- 相對路徑語義不同
- 對 SEO 不利

---

## ⚙️ 平台配置 (Config)

### 適配器特定配置

````javascript
/** @type {import('@vercel/adapter').Config} */
export const config = {
  runtime: 'edge',
  regions: ['sin1', 'hkg1']
};
````

### 配置合併

父級配置：
````javascript
export const config = {
  runtime: 'edge',
  regions: 'all',
  foo: {
    bar: true
  }
};
````

子級配置：
````javascript
export const config = {
  regions: ['us1', 'us2'],
  foo: {
    baz: true
  }
};
````

**最終合併結果**：
```javascript
{
  runtime: 'edge',
  regions: ['us1', 'us2'],
  foo: { baz: true }  // 注意：只有頂層合併
}
```

---

## 🌟 實際應用範例

### 混合式網站架構

````javascript
// 預設設定：適合大部分頁面
export const prerender = true;
export const ssr = true;
export const csr = true;
````

````javascript
// 部落格區域：靜態內容
export const prerender = true;
export const csr = false; // 純靜態，不需要 JS
````

````javascript
// 儀表板：動態內容，需要即時更新
export const prerender = false;
export const ssr = false; // SPA 模式
````

````javascript
// API 路由：可預渲染的資料
export const prerender = true;
````

### 電商網站範例

````javascript
// 整站預設
export const ssr = true;
export const csr = true;
````

````javascript
export const prerender = 'auto'; // 熱門商品預渲染，其他 SSR

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  // 只預渲染熱門商品
  const popularProducts = await getPopularProducts();
  return popularProducts.map(product => ({
    id: product.id
  }));
}
````

````javascript
// 管理後台：SPA 模式
export const ssr = false;
export const prerender = false;
````

### 多語言網站

````javascript
export const prerender = true;
export const trailingSlash = 'always';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  return [
    { lang: 'en' },
    { lang: 'zh-tw' },
    { lang: 'ja' }
  ];
}
````

### 開發環境特殊配置

````javascript
import { dev } from '$app/environment';

export const ssr = dev;     // 開發時啟用 SSR 以便除錯
export const csr = true;
export const prerender = !dev; // 生產環境預渲染
````

這個頁面選項系統讓 SvelteKit 極具彈性，可以根據不同頁面的需求採用最適合的渲染策略，從靜態網站到動態應用程式，從 SPA 到混合式架構都能輕鬆實現！
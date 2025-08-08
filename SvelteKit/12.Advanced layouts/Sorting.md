## Sorting 路由排序

這是一個關鍵機制，決定當多個路由都能匹配同一個 URL 時，SvelteKit 該選擇哪一個。

### 核心問題

**場景**：多個路由可能匹配同一個路徑

以 URL `/foo-abc` 為例，以下路由都能匹配：

```
src/routes/[...catchall]/+page.svelte     ← 捕獲所有路徑
src/routes/[[a=x]]/+page.svelte           ← 可選參數（帶匹配器）
src/routes/[b]/+page.svelte               ← 動態參數
src/routes/foo-[c]/+page.svelte           ← 部分動態路由
src/routes/foo-abc/+page.svelte           ← 靜態路由
```

**SvelteKit 需要決定使用哪一個！**

### 排序規則（按優先級遞減）

#### 1. 具體性優先原則
**更具體的路由 > 更通用的路由**

````
// 優先級：靜態 > 部分動態 > 完全動態 > 剩餘參數

✅ 最高優先級：src/routes/foo-abc/+page.svelte
   （完全靜態，最具體）

✅ 較高優先級：src/routes/foo-[c]/+page.svelte  
   （部分靜態，較具體）

✅ 中等優先級：src/routes/[b]/+page.svelte
   （完全動態，較通用）

✅ 最低優先級：src/routes/[...catchall]/+page.svelte
   （剩餘參數，最通用）
````

#### 2. 匹配器參數優先
**帶匹配器的參數 > 不帶匹配器的參數**

````javascript
// src/params/x.js
export function match(param) {
    return param === 'foo-abc';
}

// 排序結果：
src/routes/[[a=x]]/+page.svelte     ← 優先（有匹配器）
src/routes/[b]/+page.svelte         ← 次要（無匹配器）
````

#### 3. 可選和剩餘參數特殊處理
**在非末尾位置時會被忽略**

````
src/routes/x/[[y]]/z/+page.svelte   
// 排序時等同於：src/routes/x/z/+page.svelte

src/routes/a/[...rest]/b/+page.svelte
// 排序時等同於：src/routes/a/b/+page.svelte
````

#### 4. 字母順序解決平局
**當其他規則無法決定時，使用字母順序**

### 實際範例分析

#### 範例 1：基本排序

````
// 給定這些路由：
src/routes/products/laptops/+page.svelte
src/routes/products/[category]/+page.svelte
src/routes/products/[...slug]/+page.svelte
src/routes/[...catchall]/+page.svelte

// 對於 URL: /products/laptops
// 排序結果（優先級遞減）：
1. src/routes/products/laptops/+page.svelte     ← 被選中（最具體）
2. src/routes/products/[category]/+page.svelte
3. src/routes/products/[...slug]/+page.svelte
4. src/routes/[...catchall]/+page.svelte
````

#### 範例 2：匹配器的影響

````javascript
// 創建匹配器
// filepath: src/params/category.js
export function match(param) {
    return ['electronics', 'books', 'clothing'].includes(param);
}

// filepath: src/params/id.js
export function match(param) {
    return /^\d+$/.test(param);
}
````

````
// 路由結構：
src/routes/products/[name=category]/+page.svelte
src/routes/products/[slug]/+page.svelte
src/routes/products/[id=id]/+page.svelte

// 對於 URL: /products/electronics
// 排序結果：
1. src/routes/products/[name=category]/+page.svelte  ← 被選中（有匹配器且符合）
2. src/routes/products/[slug]/+page.svelte
3. src/routes/products/[id=id]/+page.svelte

// 對於 URL: /products/unknown-category
// 由於第一個路由的匹配器不符合，會選擇：
src/routes/products/[slug]/+page.svelte  ← 被選中
````

#### 範例 3：複雜情況

````
src/routes/shop/categories/electronics/+page.svelte
src/routes/shop/categories/[category]/+page.svelte  
src/routes/shop/[type]/electronics/+page.svelte
src/routes/shop/[type]/[category]/+page.svelte
src/routes/shop/[[region]]/categories/electronics/+page.svelte
src/routes/[...catchall]/+page.svelte
````

**對於 URL `/shop/categories/electronics`：**

````
1. src/routes/shop/categories/electronics/+page.svelte          ← 被選中
   (靜態段數: 3, 動態段數: 0) - 最具體

2. src/routes/shop/[[region]]/categories/electronics/+page.svelte
   (靜態段數: 2, 動態段數: 0, 可選段數: 1)

3. src/routes/shop/categories/[category]/+page.svelte
   (靜態段數: 2, 動態段數: 1)

4. src/routes/shop/[type]/electronics/+page.svelte
   (靜態段數: 2, 動態段數: 1)

5. src/routes/shop/[type]/[category]/+page.svelte
   (靜態段數: 1, 動態段數: 2)

6. src/routes/[...catchall]/+page.svelte
   (剩餘參數，最低優先級)
````

### 實用調試技巧

#### 1. 創建路由測試組件

````svelte
<script>
    import { page } from '$app/state';
    
    // 模擬不同的路由匹配
    const testUrls = [
        '/foo-abc',
        '/foo-def', 
        '/bar-xyz',
        '/anything'
    ];
    
    let currentTest = '/foo-abc';
</script>

<h1>路由排序測試</h1>

<div class="test-controls">
    {#each testUrls as url}
        <button onclick={() => goto(url)}>
            測試 {url}
        </button>
    {/each}
</div>

<div class="current-route">
    <h2>當前路由資訊</h2>
    <p>URL: {page.url.pathname}</p>
    <p>參數: {JSON.stringify(page.params)}</p>
    <p>路由ID: {page.route.id}</p>
</div>
````

#### 2. 路由優先級可視化

````javascript
/**
 * 分析路由優先級
 * @param {string} routePath 
 * @returns {object}
 */
export function analyzeRoute(routePath) {
    const segments = routePath.split('/').filter(Boolean);
    
    let score = 0;
    let staticCount = 0;
    let dynamicCount = 0;
    let optionalCount = 0;
    let restCount = 0;
    let matcherCount = 0;
    
    segments.forEach(segment => {
        if (segment.startsWith('[') && segment.endsWith(']')) {
            const inner = segment.slice(1, -1);
            
            if (inner.startsWith('...')) {
                restCount++;
                score -= 1000; // 最低優先級
            } else if (inner.startsWith('[') && inner.endsWith(']')) {
                optionalCount++;
                score -= 100;
            } else if (inner.includes('=')) {
                matcherCount++;
                dynamicCount++;
                score += 10; // 匹配器加分
            } else {
                dynamicCount++;
                score -= 10;
            }
        } else {
            staticCount++;
            score += 100; // 靜態段落最高分
        }
    });
    
    return {
        score,
        staticCount,
        dynamicCount,
        optionalCount,
        restCount,
        matcherCount,
        complexity: staticCount + dynamicCount + optionalCount + restCount
    };
}

// 使用範例
const routes = [
    'src/routes/foo-abc/+page.svelte',
    'src/routes/foo-[c]/+page.svelte', 
    'src/routes/[[a=x]]/+page.svelte',
    'src/routes/[b]/+page.svelte',
    'src/routes/[...catchall]/+page.svelte'
];

routes
    .map(route => ({ route, ...analyzeRoute(route) }))
    .sort((a, b) => b.score - a.score)
    .forEach(item => {
        console.log(`${item.route}: score=${item.score}`);
    });
````

### 最佳實踐建議

#### 1. 設計清晰的路由層次

````
// ✅ 推薦：清晰的層次結構
src/routes/products/+page.svelte                    // 產品列表
src/routes/products/categories/+page.svelte         // 分類列表  
src/routes/products/categories/[slug]/+page.svelte  // 特定分類
src/routes/products/[id=integer]/+page.svelte       // 產品詳情（數字ID）

// ❌ 避免：容易混淆的結構
src/routes/products/[category]/+page.svelte
src/routes/products/[id]/+page.svelte               // 可能與分類衝突
````

#### 2. 善用匹配器避免衝突

````javascript
export function match(param) {
    return /^P\d{6}$/.test(param); // P123456 格式
}

// filepath: src/params/category.js  
export function match(param) {
    return ['electronics', 'books', 'clothing'].includes(param);
}
````

````
// 這樣就不會有衝突：
src/routes/products/[id=productId]/+page.svelte     // P123456
src/routes/products/[slug=category]/+page.svelte    // electronics
src/routes/products/[name]/+page.svelte             // 其他任何字符串
````

#### 3. 使用 TypeScript 增強類型安全

````typescript
declare global {
    namespace App {
        interface PageData {
            // 定義頁面資料類型
        }
        interface Params {
            productId?: string;
            category?: 'electronics' | 'books' | 'clothing';
            slug?: string;
        }
    }
}
````

### 調試排序問題

當遇到意外的路由匹配時：

1. **檢查具體性**：確保靜態路由足夠具體
2. **添加匹配器**：使用參數匹配器消除歧義  
3. **調整路由結構**：重新組織路由層次
4. **使用調試工具**：創建測試頁面驗證排序行為

路由排序是 SvelteKit 的核心機制，理解這些規則能幫助您設計更穩定、可預測的路由系統。
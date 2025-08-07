## Parallel loading (並行載入)

SvelteKit 的一個重要效能優化功能就是並行載入，它能夠同時執行多個 `load` 函數，避免請求瀑布效應，大幅提升頁面載入速度。

### 基本概念

當渲染或導航到一個頁面時，SvelteKit 會：
1. **同時運行**所有相關的 `load` 函數
2. **避免請求瀑布**（sequential requests）
3. **組合結果**到單一響應中
4. **等待所有完成**後才渲染頁面

### 並行載入的運作方式

````javascript
/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  return {
    posts: await db.getPostSummaries() // 這會並行執行
  };
}
````

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  return {
    post: await db.getPost(params.slug) // 這也會並行執行
  };
}
````

在上面的例子中，`getPostSummaries()` 和 `getPost()` 會**同時**執行，而不是依序執行。

### 實際應用範例

#### 1. 電商產品頁面的並行載入

````javascript
import { getCategories, getBrands } from '$lib/server/api';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  return {
    // 這些會並行載入
    categories: await getCategories(),
    brands: await getBrands()
  };
}
````

````javascript
import { getProduct, getReviews, getRelatedProducts } from '$lib/server/api';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  return {
    // 這些也會並行載入，同時與 layout 的請求並行
    product: await getProduct(params.id),
    reviews: await getReviews(params.id),
    relatedProducts: await getRelatedProducts(params.id)
  };
}
````

在這個範例中，總共有 5 個 API 請求會**同時**執行：
- `getCategories()`
- `getBrands()`
- `getProduct()`
- `getReviews()`
- `getRelatedProducts()`

#### 2. 儀表板頁面的複雜並行載入

````javascript
/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
  return {
    // 用戶基本資訊和通知並行載入
    user: await getUser(locals.userId),
    notifications: await getNotifications(locals.userId)
  };
}
````

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  return {
    // 所有分析數據並行載入
    salesData: await getSalesData(locals.userId),
    trafficData: await getTrafficData(locals.userId),
    conversionData: await getConversionData(locals.userId),
    revenueData: await getRevenueData(locals.userId)
  };
}
````

### 客戶端導航的並行優化

在客戶端導航期間，SvelteKit 會將多個服務器 `load` 函數的調用組合到**單個 HTTP 請求**中：

````javascript
// 當從 /blog/post-1 導航到 /blog/post-2 時
// SvelteKit 會自動組合所有需要重新運行的 load 函數到一個請求中
````

### 避免瀑布流的最佳實踐

#### ❌ 錯誤的瀑布流寫法

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  // 這會造成瀑布流 - 每個請求都要等前一個完成
  const user = await getUser(params.id);
  const posts = await getUserPosts(user.id);
  const followers = await getFollowers(user.id);
  
  return { user, posts, followers };
}
````

#### ✅ 正確的並行寫法

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  // 所有請求並行執行
  return {
    user: await getUser(params.id),
    posts: await getUserPosts(params.id), // 直接使用 params.id
    followers: await getFollowers(params.id)
  };
}
````

#### ✅ 更進階的並行控制

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  // 如果某些請求確實需要依賴其他請求的結果
  const userPromise = getUser(params.id);
  
  return {
    user: await userPromise,
    // 這些可以在獲取用戶資料的同時並行執行
    posts: getUserPosts(params.id),
    settings: getUserSettings(params.id),
    // 如果需要用戶資料，可以這樣處理
    recommendations: userPromise.then(user => getRecommendations(user.preferences))
  };
}
````

### parent() 調用對並行的影響

使用 `await parent()` 會影響並行執行：

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent }) {
  // ❌ 這會阻塞並行執行
  const parentData = await parent();
  const post = await getPost(params.slug);
  
  return {
    ...parentData,
    post
  };
}
````

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent }) {
  // ✅ 如果不依賴 parent 資料，先開始獨立請求
  const postPromise = getPost(params.slug);
  const parentData = await parent();
  
  return {
    ...parentData,
    post: await postPromise
  };
}
````

### 實際效能比較

#### 傳統瀑布流方式：
```
時間軸: 0ms -----> 100ms -----> 200ms -----> 300ms
       getUser()   getPosts()   getFollowers()  完成
總時間: 300ms
```

#### SvelteKit 並行載入：
```
時間軸: 0ms -----------------> 100ms
       getUser()    │
       getPosts()   │ 全部並行執行
       getFollowers()│
總時間: 100ms (提升 3 倍效能!)
```

### 監控並行載入效能

您可以在 `load` 函數中加入時間戳記來監控效能：

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const startTime = Date.now();
  
  const results = await Promise.all([
    getUser(params.id),
    getPosts(params.id),
    getFollowers(params.id)
  ]);
  
  const loadTime = Date.now() - startTime;
  console.log(`並行載入完成，耗時: ${loadTime}ms`);
  
  return {
    user: results[0],
    posts: results[1],
    followers: results[2],
    loadTime
  };
}
````

### 重要注意事項

1. **錯誤處理**：如果任何一個並行 `load` 函數失敗，整個頁面會顯示錯誤
2. **記憶體使用**：大量並行請求可能增加伺服器記憶體使用
3. **API 限制**：注意外部 API 的併發請求限制
4. **依賴關係**：確保並行執行的函數之間沒有數據依賴

並行載入是 SvelteKit 效能優化的核心特性之一，正確使用可以顯著改善用戶體驗和頁面載入速度。
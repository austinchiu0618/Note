## Streaming with promises (流式 Promise)

SvelteKit 的一個強大功能是能夠將 Promise 流式傳輸到瀏覽器，這讓您可以在等待較慢數據的同時先渲染頁面的其他部分。

### 基本概念

當您在服務端 `load` 函數中返回 Promise 時，SvelteKit 會：
1. 立即開始渲染頁面
2. 當 Promise resolve 時，將結果流式傳輸到瀏覽器
3. 動態更新頁面內容

### 基本範例

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  return {
    // 先 await 重要數據，確保頁面可以立即渲染
    post: await loadPost(params.slug),
    // 不 await 次要數據，讓它流式傳輸
    comments: loadComments(params.slug),
    recommendations: loadRecommendations(params.slug)
  };
}
````

### 在 Svelte 組件中處理流式數據

````svelte
<script>
  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>

<!-- 使用 #await 處理流式 Promise -->
{#await data.comments}
  <div class="loading">
    <div class="skeleton">載入評論中...</div>
  </div>
{:then comments}
  <section class="comments">
    <h2>評論 ({comments.length})</h2>
    {#each comments as comment}
      <div class="comment">
        <strong>{comment.author}</strong>
        <p>{comment.content}</p>
        <time>{comment.createdAt}</time>
      </div>
    {/each}
  </section>
{:catch error}
  <div class="error">
    載入評論失敗：{error.message}
  </div>
{/await}

{#await data.recommendations}
  <div class="loading">載入推薦文章...</div>
{:then recommendations}
  <aside class="recommendations">
    <h3>推薦閱讀</h3>
    {#each recommendations as rec}
      <a href="/blog/{rec.slug}">{rec.title}</a>
    {/each}
  </aside>
{:catch error}
  <div class="error">無法載入推薦</div>
{/await}
````

### 實際應用場景

#### 1. 電商產品頁面

````javascript
import { getProduct, getReviews, getRecommendations, checkInventory } from '$lib/server/api';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  return {
    // 核心產品資訊必須立即可用
    product: await getProduct(params.id),
    
    // 這些可以稍後載入
    reviews: getReviews(params.id),
    recommendations: getRecommendations(params.id),
    inventory: checkInventory(params.id)
  };
}
````

````svelte
<script>
  let { data } = $props();
</script>

<!-- 立即顯示產品資訊 -->
<div class="product-info">
  <h1>{data.product.name}</h1>
  <p class="price">${data.product.price}</p>
  <img src={data.product.image} alt={data.product.name} />
</div>

<!-- 庫存狀態 - 流式載入 -->
{#await data.inventory}
  <div class="stock-loading">檢查庫存中...</div>
{:then inventory}
  <div class="stock-info">
    {#if inventory.inStock}
      <span class="in-stock">現貨供應</span>
    {:else}
      <span class="out-of-stock">缺貨</span>
    {/if}
  </div>
{:catch}
  <div class="stock-error">無法檢查庫存</div>
{/await}

<!-- 評論區域 - 流式載入 -->
{#await data.reviews}
  <div class="reviews-skeleton">
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
  </div>
{:then reviews}
  <section class="reviews">
    <h2>顧客評價</h2>
    {#each reviews as review}
      <div class="review">
        <div class="rating">{'★'.repeat(review.rating)}</div>
        <p>{review.comment}</p>
      </div>
    {/each}
  </section>
{/await}
````

#### 2. 儀表板頁面

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  return {
    // 用戶基本資訊立即載入
    user: await getUser(locals.userId),
    
    // 各種統計數據可以稍後載入
    analytics: getAnalytics(locals.userId),
    notifications: getNotifications(locals.userId),
    recentActivity: getRecentActivity(locals.userId),
    weatherData: getWeatherData()
  };
}
````

### 多個 Promise 的組合處理

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  // 創建 Promise 但不立即 await
  const userPromise = getUser(params.id);
  const postsPromise = getUserPosts(params.id);
  const followersPromise = getFollowers(params.id);
  
  return {
    // 等待用戶資料，因為這是頁面渲染的必要條件
    user: await userPromise,
    
    // 這些可以流式載入
    posts: postsPromise,
    followers: followersPromise,
    
    // 也可以組合多個 Promise
    socialStats: Promise.all([
      getFollowersCount(params.id),
      getFollowingCount(params.id),
      getPostsCount(params.id)
    ])
  };
}
````

### 錯誤處理的最佳實踐

````javascript
/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
  // 為每個 Promise 添加錯誤處理
  const commentsPromise = loadComments(params.id).catch(error => {
    console.error('Failed to load comments:', error);
    return []; // 返回空陣列作為降級方案
  });
  
  const ratingsPromise = loadRatings(params.id).catch(() => {
    return { average: 0, count: 0 }; // 降級數據
  });
  
  // 對於可能失敗的 Promise，添加空的 catch 以避免 unhandled rejection
  const optionalDataPromise = loadOptionalData(params.id);
  optionalDataPromise.catch(() => {}); // 標記為已處理
  
  return {
    post: await loadPost(params.id), // 這個必須成功
    comments: commentsPromise,
    ratings: ratingsPromise,
    optionalData: optionalDataPromise
  };
}
````

### 載入狀態的優化設計

````svelte
<script>
  let { promise, fallback = '載入中...', class: className = '' } = $props();
</script>

{#await promise}
  <div class="loading-container {className}">
    <div class="loading-spinner"></div>
    <span>{fallback}</span>
  </div>
{:then data}
  {@render children?.(data)}
{:catch error}
  <div class="error-container">
    <span class="error-icon">⚠️</span>
    <span>載入失敗</span>
    <button onclick={() => window.location.reload()}>重試</button>
  </div>
{/await}

<style>
  .loading-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 0.5rem;
  }
  
  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
````

### 重要注意事項

1. **平台支援**：
   - 在不支援流式傳輸的平台（如 AWS Lambda）上，響應會被緩衝
   - 確保您的代理服務器（如 NGINX）不會緩衝響應

2. **JavaScript 需求**：
   - 流式數據傳輸只有在啟用 JavaScript 時才能工作
   - 考慮為非 JavaScript 環境提供降級方案

3. **頭部限制**：
   - 一旦開始流式傳輸，就無法更改響應頭和狀態碼
   - 不能在流式 Promise 內使用 `setHeaders` 或 `redirect`

4. **版本差異**：
   - SvelteKit 2.x 中只有返回的 Promise 才會流式傳輸
   - 1.x 版本中頂層 Promise 會自動等待

通過合理使用 Promise 流式傳輸，您可以顯著改善用戶體驗，讓頁面更快地呈現核心內容，同時在背景載入次要數據。
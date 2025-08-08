# Rerunning load functions (重新運行 load 函數)

## 概述

SvelteKit 會智能地追蹤每個 `load` 函數的依賴關係，以避免在導航過程中不必要的重新執行。這是一個重要的效能最佳化機制。

## 基本概念

### 依賴追蹤機制

SvelteKit 會自動追蹤 `load` 函數使用了哪些參數和資料，只有當這些依賴項發生變化時，函數才會重新執行。

````javascript
// src/routes/blog/[slug]/+page.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  return {
    post: await db.getPost(params.slug)
  };
}
````

````javascript
// src/routes/blog/[slug]/+layout.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  return {
    posts: await db.getPostSummaries()
  };
}
````

在上面的例子中：
- 當從 `/blog/article-1` 導航到 `/blog/article-2` 時
- `+page.server.js` 會重新執行（因為 `params.slug` 改變了）
- `+layout.server.js` **不會**重新執行（因為它不依賴於 `params.slug`）

## Load 函數何時重新執行？

### 1. 參數變化
當 `params` 中引用的屬性值發生變化：

````javascript
// 依賴 params.id
export function load({ params }) {
  return fetchUserData(params.id); // id 變化時會重新執行
}
````

### 2. URL 屬性變化
當引用的 URL 屬性發生變化：

````javascript
export function load({ url }) {
  // 當 pathname 變化時重新執行
  const isHomePage = url.pathname === '/';
  
  // 當 search 參數變化時重新執行
  const query = url.search;
  
  return { isHomePage, query };
}
````

### 3. 搜尋參數變化
當使用特定的搜尋參數方法：

````javascript
export function load({ url }) {
  // 只有當 'page' 參數變化時才重新執行
  const page = url.searchParams.get('page');
  
  // 從 ?page=1&sort=name 到 ?page=1&sort=date 不會重新執行
  // 從 ?page=1 到 ?page=2 會重新執行
  
  return { page };
}
````

### 4. 父級 load 函數重新執行
當調用 `await parent()` 且父級函數重新執行：

````javascript
export async function load({ parent }) {
  const parentData = await parent();
  
  // 如果父級重新執行，這個函數也會重新執行
  return {
    ...parentData,
    additionalData: 'some data'
  };
}
````

### 5. 手動失效化
通過 `invalidate()` 或 `invalidateAll()` 觸發：

````javascript
// +page.js
export async function load({ fetch, depends }) {
  // 宣告依賴
  depends('app:posts');
  
  const response = await fetch('/api/posts');
  return { posts: await response.json() };
}
````

````svelte
<!-- +page.svelte -->
<script>
  import { invalidate } from '$app/navigation';
  
  function refreshPosts() {
    // 這會導致依賴 'app:posts' 的 load 函數重新執行
    invalidate('app:posts');
  }
</script>

<button onclick={refreshPosts}>重新整理貼文</button>
````

## 取消依賴追蹤

在某些情況下，你可能想要排除某些內容的依賴追蹤：

````javascript
export async function load({ untrack, url }) {
  // 不追蹤 url.pathname，路徑變化不會觸發重新執行
  if (untrack(() => url.pathname === '/')) {
    return { message: 'Welcome!' };
  }
}
````

## 手動失效化策略

### 使用 depends()

````javascript
// +page.js
export async function load({ fetch, depends }) {
  // 多種依賴宣告方式
  depends('app:user-data');
  depends('https://api.example.com/users');
  
  const response = await fetch('/api/user');
  return { user: await response.json() };
}
````

### 失效化觸發

````svelte
<script>
  import { invalidate, invalidateAll } from '$app/navigation';
  
  function refreshUserData() {
    // 方式 1: 依據自定義標識符
    invalidate('app:user-data');
    
    // 方式 2: 依據 URL
    invalidate('https://api.example.com/users');
    
    // 方式 3: 使用函數過濾
    invalidate(url => url.href.includes('users'));
    
    // 方式 4: 重新執行所有 load 函數
    invalidateAll();
  }
</script>
````

## 實際應用範例

### 購物車頁面

````javascript
// src/routes/cart/+page.js
export async function load({ fetch, depends }) {
  // 宣告依賴，方便手動更新
  depends('app:cart');
  
  const response = await fetch('/api/cart');
  return {
    items: await response.json()
  };
}
````

````svelte
<!-- src/routes/cart/+page.svelte -->
<script>
  import { invalidate } from '$app/navigation';
  
  let { data } = $props();
  
  async function removeItem(itemId) {
    await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
    
    // 重新載入購物車資料
    invalidate('app:cart');
  }
</script>

{#each data.items as item}
  <div>
    {item.name}
    <button onclick={() => removeItem(item.id)}>移除</button>
  </div>
{/each}
````

## 注意事項

1. **依賴追蹤僅在 load 函數執行期間有效**
   - 在嵌套的 Promise 或回調中存取參數不會建立依賴關係

2. **避免不必要的依賴**
   - 只在真正需要時才存取 `params` 或 `url` 屬性

3. **搜尋參數的獨立追蹤**
   - 每個搜尋參數都是獨立追蹤的

4. **效能考量**
   - 合理使用 `untrack()` 避免過度的重新執行

這個機制讓 SvelteKit 應用程式能夠智能地更新資料，提供良好的使用者體驗同時保持高效能。

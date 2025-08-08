## 🎯 State Management 狀態管理概述

在 SvelteKit 這種全端應用框架中，狀態管理與純客戶端應用有很大不同。由於需要跨服務端和客戶端，狀態管理變得更加複雜，需要特別注意避免常見的陷阱。

---

## ⚠️ 避免在服務端共享狀態

### 服務端 vs 客戶端的差異

- **瀏覽器（客戶端）**：**有狀態的** - 狀態在用戶與應用程式交互時存儲在記憶體中
- **服務端**：**無狀態的** - 響應的內容完全取決於請求的內容

### ❌ 錯誤示例：共享變數

````javascript
let user; // 這是錯誤的！所有用戶共享這個變數

/** @type {import('./$types').PageServerLoad} */
export function load() {
  return { user };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    // 永遠不要這樣做！
    user = {
      name: data.get('name'),
      embarrassingSecret: data.get('secret')
    };
  }
};
````

**問題**：
- Alice 提交秘密後，Bob 訪問頁面時會看到 Alice 的秘密
- 服務器重啟時，資料會遺失
- 所有用戶共享同一個變數

### ✅ 正確做法：使用 Cookies 和資料庫

````javascript
import { redirect } from '@sveltejs/kit';
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
  const sessionId = cookies.get('session');
  if (sessionId) {
    const user = await db.getUserBySession(sessionId);
    return { user };
  }
  return { user: null };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    
    // 正確：將資料存到資料庫
    const user = await db.createUser({
      name: data.get('name'),
      secret: data.get('secret')
    });
    
    // 設置 session cookie
    const sessionId = await db.createSession(user.id);
    cookies.set('session', sessionId, { 
      path: '/', 
      httpOnly: true,
      secure: true 
    });
    
    throw redirect(303, '/dashboard');
  }
};
````

---

## 🚫 Load 函數中不要有副作用

### ❌ 錯誤示例：在 load 中寫入 store

````javascript
import { user } from '$lib/user';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const response = await fetch('/api/user');

  // 永遠不要這樣做！
  user.set(await response.json());
}
````

**問題**：
- 會將一個用戶的資訊放到所有用戶共享的地方
- 破壞了 load 函數的純函數特性

### ✅ 正確做法：直接返回資料

````javascript
js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const response = await fetch('/api/user');

  return {
    user: await response.json()
  };
}
````

---

## 🔗 使用帶上下文的狀態和 Stores

### Context API 的重要性

SvelteKit 的 app 狀態在服務端使用 Svelte 的 **Context API**，確保每個請求都有獨立的狀態空間。

### 實作範例

````svelte
<script>
  import { setContext } from 'svelte';

  /** @type {{ data: import('./$types').LayoutData }} */
  let { data } = $props();

  // 將引用我們狀態的函數傳遞給上下文，供子組件訪問
  setContext('user', () => data.user);
</script>
````

````svelte
<script>
  import { getContext } from 'svelte';

  // 從上下文中獲取 user
  const user = getContext('user');
</script>

<p>Welcome {user().name}</p>
````

### 為什麼傳遞函數？

````javascript
// ✅ 正確：傳遞函數保持響應性
setContext('user', () => data.user);

// ❌ 錯誤：直接傳遞值會失去響應性
setContext('user', data.user);
````

### 狀態更新的注意事項

- **SSR 時**：深層組件更新狀態不會影響父組件（因為父組件已渲染完成）
- **CSR 時**：狀態會向上傳播，所有組件都會響應
- **建議**：將狀態向下傳遞，避免水合過程中的"閃爍"

---

## 🔄 組件和頁面狀態會被保留

### 組件重用機制

當在應用程式中導航時，SvelteKit 會重用現有的布局和頁面組件。

### ❌ 錯誤示例：非響應式計算

````svelte
<script>
  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();

  // 這段代碼有 BUG！
  const wordCount = data.content.split(' ').length;
  const estimatedReadingTime = wordCount / 250;
</script>

<header>
  <h1>{data.title}</h1>
  <p>Reading time: {Math.round(estimatedReadingTime)} minutes</p>
</header>

<div>{@html data.content}</div>
````

**問題**：從 `/blog/my-short-post` 導航到 `/blog/my-long-post` 時，`estimatedReadingTime` 不會重新計算。

### ✅ 正確做法：使用響應式

````svelte
<!-- filepath: src/routes/blog/[slug]/+page.svelte -->
<script>
  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();

  let wordCount = $derived(data.content.split(' ').length);
  let estimatedReadingTime = $derived(wordCount / 250);
</script>
````

### 導航生命週期

如果需要在導航時執行代碼：

````svelte
<script>
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';

  // 每次導航後執行
  afterNavigate(() => {
    console.log('頁面導航完成');
  });

  // 導航前執行
  beforeNavigate(() => {
    console.log('即將離開頁面');
  });

  // 只在組件首次掛載時執行
  onMount(() => {
    console.log('組件掛載');
  });
</script>
````

### 強制重新掛載組件

````svelte
<script>
  import { page } from '$app/state';
</script>

{#key page.url.pathname}
  <BlogPost title={data.title} content={data.content} />
{/key}
````

---

## 🔗 在 URL 中存儲狀態

### 適用場景

適合存儲需要在頁面重新載入後保持的狀態，如：
- 表格過濾器
- 排序規則
- 分頁資訊

### 實作範例

````svelte
<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';

  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();

  // 從 URL 搜尋參數獲取狀態
  let sortBy = $derived(page.url.searchParams.get('sort') || 'name');
  let order = $derived(page.url.searchParams.get('order') || 'asc');

  function updateSort(newSort) {
    const params = new URLSearchParams(page.url.searchParams);
    params.set('sort', newSort);
    goto(`?${params}`, { replaceState: true });
  }
</script>

<select value={sortBy} onchange={(e) => updateSort(e.target.value)}>
  <option value="name">名稱</option>
  <option value="price">價格</option>
  <option value="date">日期</option>
</select>
````

````javascript
/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  const sortBy = url.searchParams.get('sort') || 'name';
  const order = url.searchParams.get('order') || 'asc';

  const products = await getProducts({ sortBy, order });

  return { products, sortBy, order };
}
````

---

## 📸 在快照中存儲臨時狀態

### 適用場景

適合存儲可丟棄但希望在導航時保持的 UI 狀態：
- 列表展開/收縮狀態
- 表單輸入內容（未提交）
- 滾動位置

### 實作範例

````svelte
<script>
  import { browser } from '$app/environment';

  let expanded = $state(false);
  let formData = $state({ name: '', email: '' });

  // 導出快照
  export const snapshot = {
    capture: () => ({ expanded, formData }),
    restore: (snapshot) => {
      expanded = snapshot.expanded;
      formData = snapshot.formData;
    }
  };
</script>

<details bind:open={expanded}>
  <summary>展開詳細資訊</summary>
  <form>
    <input bind:value={formData.name} placeholder="姓名" />
    <input bind:value={formData.email} placeholder="電子郵件" />
  </form>
</details>
````

---

## 🛠️ 實際應用範例

### 完整的用戶管理系統

````javascript
import { getContext, setContext } from 'svelte';

const USER_CONTEXT_KEY = 'user';

export function setUserContext(user) {
  return setContext(USER_CONTEXT_KEY, () => user);
}

export function getUserContext() {
  return getContext(USER_CONTEXT_KEY);
}
````

````svelte
<script>
  import { setUserContext } from '$lib/stores/user';

  /** @type {{ data: import('./$types').LayoutData }} */
  let { data, children } = $props();

  // 設置用戶上下文
  setUserContext(data.user);
</script>

{@render children()}
````

````svelte
<script>
  import { getUserContext } from '$lib/stores/user';

  const user = getUserContext();
</script>

{#if user()}
  <h1>歡迎, {user().name}!</h1>
  <p>您的角色：{user().role}</p>
{:else}
  <p>請先登入</p>
{/if}
````

### 購物車狀態管理

````javascript
export function createCartStore() {
  let items = $state([]);

  return {
    get items() { return items; },
    get total() { 
      return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    add(product) {
      const existing = items.find(item => item.id === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        items.push({ ...product, quantity: 1 });
      }
    },
    remove(productId) {
      items = items.filter(item => item.id !== productId);
    },
    clear() {
      items = [];
    }
  };
}
````

````svelte
<script>
  import { setContext } from 'svelte';
  import { createCartStore } from '$lib/stores/cart';

  const cart = createCartStore();
  setContext('cart', cart);
</script>
````

這個狀態管理系統確保了在 SvelteKit 的全端環境中，狀態能夠安全、正確地在服務端和客戶端之間管理，避免了常見的資料洩漏和狀態同步問題！
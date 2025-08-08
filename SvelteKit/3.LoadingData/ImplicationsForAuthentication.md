# Implications for authentication (對身份驗證的影響)

## 概述

SvelteKit 的數據加載機制對身份驗證有重要的影響，因為 `load` 函數的執行時機和並行性質可能會影響身份驗證檢查的效果。

## 主要問題

### 1. 佈局 Load 函數不會在每次請求時運行

````javascript
// src/routes/+layout.server.js
export async function load({ locals }) {
  // 這個身份驗證檢查可能不會在每次導航時執行
  if (!locals.user) {
    redirect(307, '/login');
  }
  
  return {
    user: locals.user
  };
}
````

**問題：** 當用户在子路由之間進行客户端導航時，佈局的 `load` 函數可能不會重新執行，導致身份驗證檢查被跳過。

### 2. 並行執行的問題

````javascript
// src/routes/dashboard/+layout.server.js
export async function load({ locals }) {
  if (!locals.user) {
    error(401, 'Unauthorized');
  }
  return { user: locals.user };
}

// src/routes/dashboard/+page.server.js  
export async function load({ locals }) {
  // 這個函數會與上面的佈局 load 並行執行
  // 即使佈局拋出錯誤，這裡的敏感數據仍可能被載入
  const sensitiveData = await getSensitiveUserData(locals.user?.id);
  
  return { sensitiveData };
}
````

**問題：** 佈局和頁面的 `load` 函數會並行執行，即使佈局拋出身份驗證錯誤，頁面的 `load` 函數仍會執行。

## 推薦的解決策略

### 策略 1: 使用 Hooks 進行全局保護

````javascript
// src/hooks.server.js
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
  // 在任何 load 函數執行之前檢查身份驗證
  const protectedRoutes = ['/dashboard', '/admin', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => 
    event.url.pathname.startsWith(route)
  );
  
  if (isProtectedRoute && !event.locals.user) {
    throw redirect(307, '/login');
  }
  
  return resolve(event);
}
````

**優點：**
- 在所有 `load` 函數執行前進行檢查
- 保護多個路由
- 不影響 `load` 函數的並行執行和緩存

### 策略 2: 在特定頁面進行保護

````javascript
// src/routes/dashboard/secret/+page.server.js
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
  // 直接在需要保護的頁面進行身份驗證
  if (!locals.user) {
    error(401, 'Unauthorized');
  }
  
  if (!locals.user.hasPermission('view-secrets')) {
    error(403, 'Forbidden');
  }
  
  const secretData = await getSecretData();
  return { secretData };
}
````

**優點：**
- 精確控制特定路由的保護
- 不依賴於佈局的執行順序

### 策略 3: 使用 `await parent()` 確保順序

````javascript
// src/routes/dashboard/+layout.server.js
export async function load({ locals }) {
  if (!locals.user) {
    error(401, 'Unauthorized');
  }
  return { user: locals.user };
}

// src/routes/dashboard/+page.server.js
export async function load({ parent }) {
  // 確保父級身份驗證檢查先完成
  await parent();
  
  // 只有在身份驗證通過後才會執行到這裡
  const userData = await getUserData();
  return { userData };
}
````

**缺點：**
- 創建依賴鏈，可能影響性能
- 需要每個子頁面都調用 `await parent()`

## 使用 `getRequestEvent` 的共享驗證邏輯

````javascript
// src/lib/server/auth.js
import { redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';

export function requireLogin() {
  const { locals, url } = getRequestEvent();
  
  if (!locals.user) {
    const redirectTo = url.pathname + url.search;
    const params = new URLSearchParams({ redirectTo });
    redirect(307, `/login?${params}`);
  }
  
  return locals.user;
}

export function requireRole(role) {
  const user = requireLogin();
  
  if (!user.roles.includes(role)) {
    error(403, 'Insufficient permissions');
  }
  
  return user;
}
````

使用共享驗證邏輯：

````javascript
// src/routes/admin/+page.server.js
import { requireRole } from '$lib/server/auth';

export function load() {
  const user = requireRole('admin');
  
  // 這裡保證用户已登入且有 admin 權限
  return {
    message: `Hello admin ${user.name}!`
  };
}
````

## 實際應用範例

### 多層級權限檢查

````javascript
// src/routes/admin/+layout.server.js
export async function load({ locals }) {
  // 基本身份驗證檢查
  if (!locals.user) {
    redirect(307, '/login');
  }
  
  // 管理員權限檢查
  if (!locals.user.isAdmin) {
    error(403, 'Admin access required');
  }
  
  return {
    user: locals.user,
    adminMenuItems: await getAdminMenuItems()
  };
}

// src/routes/admin/users/+page.server.js
export async function load({ parent }) {
  // 確保通過管理員驗證
  const { user } = await parent();
  
  // 額外的特定權限檢查
  if (!user.permissions.includes('manage-users')) {
    error(403, 'User management permission required');
  }
  
  return {
    users: await getAllUsers()
  };
}
````

### 結合客户端狀態管理

````svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  
  let { data, children } = $props();
  
  // 客户端額外檢查（作為後備）
  $effect(() => {
    if (!data.user && page.url.pathname.startsWith('/dashboard')) {
      goto('/login');
    }
  });
</script>

{#if data.user}
  {@render children()}
{:else}
  <p>Please log in to continue.</p>
{/if}
````

## 最佳實踐總結

1. **使用 Hooks 進行全局保護** - 最安全和高效的方法
2. **在特定頁面進行細粒度控制** - 適合複雜權限需求
3. **避免僅依賴佈局身份驗證** - 可能因緩存而被跳過
4. **使用共享驗證函數** - 保持代碼 DRY 和一致性
5. **客户端作為後備檢查** - 提供更好的用户體驗

通過理解這些影響並採用適當的策略，可以構建安全且高效的身份驗證系統。
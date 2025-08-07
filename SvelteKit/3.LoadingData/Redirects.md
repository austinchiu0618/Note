## Redirects (重定向)

在 SvelteKit 中，重定向是一個常見的需求，比如用戶未登入時重定向到登入頁面，或是將舊的 URL 重定向到新的位置。

### 基本重定向語法

使用 `@sveltejs/kit` 中的 `redirect` 函數來實現重定向：

````javascript
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
  if (!locals.user) {
    redirect(307, '/login');
  }
}
````

### 重定向狀態碼

重定向需要指定 HTTP 狀態碼，常用的有：

- `301` - 永久重定向
- `302` - 臨時重定向  
- `307` - 臨時重定向（保持原始請求方法）
- `308` - 永久重定向（保持原始請求方法）

### 實際應用範例

#### 1. 用戶認證重定向

````javascript
d/+page.server.js
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export function load({ locals, url }) {
  // 檢查用戶是否已登入
  if (!locals.user) {
    // 保存當前頁面，登入後可以重定向回來
    const redirectTo = url.pathname + url.search;
    redirect(302, `/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  
  return {
    user: locals.user
  };
}
````

#### 2. 權限檢查重定向

````javascript
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
  if (!locals.user) {
    redirect(401, '/login');
  }
  
  if (!locals.user.isAdmin) {
    redirect(403, '/unauthorized');
  }
  
  return {
    user: locals.user
  };
}
````

#### 3. 登入後重定向

````javascript
// filepath: src/routes/login/+page.server.js
import { redirect, fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const actions = {
  default: async ({ request, cookies, url }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');
    
    const user = await auth.signIn(email, password);
    
    if (!user) {
      return fail(400, { error: '登入失敗' });
    }
    
    // 設置 session cookie
    cookies.set('session', user.sessionId, { path: '/' });
    
    // 檢查是否有重定向目標
    const redirectTo = url.searchParams.get('redirect') || '/dashboard';
    redirect(302, redirectTo);
  }
};
````

### 客戶端重定向

在瀏覽器中，您也可以使用 `goto` 函數進行程式化導航：

````javascript
<script>
  import { goto } from '$app/navigation';
  
  function handleLogout() {
    // 執行登出邏輯
    // ...
    
    // 重定向到首頁
    goto('/');
  }
</script>

<button onclick={handleLogout}>登出</button>
````

### 重要注意事項

1. **避免在 try-catch 中使用**：
   ```javascript
   // ❌ 錯誤用法
   try {
     redirect(302, '/login');
   } catch (e) {
     // redirect 會立即觸發 catch
   }
   ```

2. **redirect 會拋出異常**：
   ```javascript
   // ✅ 正確理解
   export function load({ locals }) {
     if (!locals.user) {
       redirect(302, '/login');
       // 這行代碼不會執行
       console.log('這不會被印出');
     }
   }
   ```

3. **條件重定向**：
   ```javascript
   export function load({ locals, route }) {
     // 根據路由條件重定向
     if (route.id === '/old-path' && locals.user) {
       redirect(301, '/new-path');
     }
   }
   ```

### 實用重定向模式

#### URL 正規化

````javascript
import { redirect } from '@sveltejs/kit';

export function load({ params, url }) {
  const slug = params.slug;
  
  // 移除結尾的斜線
  if (slug.endsWith('/')) {
    const newSlug = slug.slice(0, -1);
    redirect(301, `/blog/${newSlug}`);
  }
  
  // 確保 slug 為小寫
  if (slug !== slug.toLowerCase()) {
    redirect(301, `/blog/${slug.toLowerCase()}`);
  }
}
````

#### 語言重定向

````javascript
import { redirect } from '@sveltejs/kit';

export function load({ request, url }) {
  const acceptLanguage = request.headers.get('accept-language');
  const pathname = url.pathname;
  
  // 如果 URL 沒有語言前綴，根據瀏覽器語言重定向
  if (pathname === '/' || pathname === '') {
    const preferredLang = acceptLanguage?.includes('zh') ? 'zh' : 'en';
    redirect(302, `/${preferredLang}`);
  }
}
````

透過這些範例，您可以看到 `redirect` 在 SvelteKit 中是一個強大且靈活的工具，可以處理各種重定向需求。記住，重定向會立即停止當前函數的執行，所以要謹慎使用。

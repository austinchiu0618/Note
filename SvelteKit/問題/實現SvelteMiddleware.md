SvelteKit 主要透過以下幾種方式實現 middleware 的功能：

## 1. Hooks (主要的 middleware 機制)

SvelteKit 使用 **hooks** 來實現 middleware 功能，在 `src/hooks.server.js` 或 `src/hooks.client.js` 中定義：

````javascript
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    // 類似 Nuxt middleware 的邏輯
    const token = event.cookies.get('auth-token');
    
    // 身份驗證檢查
    if (event.url.pathname.startsWith('/admin') && !token) {
        throw redirect(302, '/login');
    }
    
    // 添加用戶資訊到 locals
    if (token) {
        event.locals.user = await getUserFromToken(token);
    }
    
    // 繼續處理請求
    const response = await resolve(event);
    
    // 可以修改回應
    response.headers.set('x-custom-header', 'value');
    
    return response;
}
````

## 2. Load Functions (頁面級 middleware)

在 `+layout.server.js` 或 `+page.server.js` 中定義：

````javascript
import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
    // 類似頁面級 middleware
    if (url.pathname.startsWith('/dashboard') && !locals.user) {
        throw redirect(302, '/login');
    }
    
    return {
        user: locals.user
    };
}
````

## 3. 多個 Hooks 處理

````javascript
import { sequence } from '@sveltejs/kit/hooks';

async function authentication({ event, resolve }) {
    // 身份驗證邏輯
    return resolve(event);
}

async function logging({ event, resolve }) {
    // 日誌記錄邏輯
    console.log(`${event.request.method} ${event.url.pathname}`);
    return resolve(event);
}

export const handle = sequence(authentication, logging);
````

## 4. 客戶端 Hooks

````javascript
export async function handleError({ error, event }) {
    // 客戶端錯誤處理
    console.error('Client error:', error);
}
````

## 主要差異對比

| 功能 | Nuxt Middleware | SvelteKit |
|------|----------------|-----------|
| 全域 middleware | `middleware/` 資料夾 | `hooks.server.js` |
| 頁面級 middleware | 頁面中定義 | `load` functions |
| 路由保護 | `definePageMeta` | `load` + `redirect` |
| 執行順序 | 依檔名排序 | `sequence()` 函數 |

SvelteKit 的 hooks 系統提供了與 middleware 相似的功能，但設計更加靈活和統一。
## 🎯 什麼是 Hooks？

Hooks 是您在應用程式範圍內聲明的函數，SvelteKit 會在響應特定事件時自動調用它們，讓您能夠對框架的行為進行精細控制。

## 📁 Hook 檔案結構

SvelteKit 有三個可選的 hook 檔案：

```
src/
├── hooks.server.js    # 服務端 hooks
├── hooks.client.js    # 客戶端 hooks
└── hooks.js          # 通用 hooks（服務端+客戶端都執行）
```

---

## 🖥️ 服務端 Hooks

### 1. `handle` - 請求處理器

每當服務端接收到請求時都會執行，是最重要的 hook。

````javascript
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // 自定義路由處理
  if (event.url.pathname.startsWith('/custom')) {
    return new Response('自定義響應');
  }

  // 執行正常路由處理
  const response = await resolve(event);
  
  // 修改響應
  response.headers.set('x-custom-header', 'potato');
  
  return response;
}
````

### 2. `locals` - 添加自定義數據

向請求中添加自定義數據，這些數據會傳遞給處理程序和 `load` 函數。

````javascript
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // 添加用戶信息到 locals
  event.locals.user = await getUserInformation(event.cookies.get('sessionid'));

  const response = await resolve(event);
  return response;
}
````

#### TypeScript 類型定義

````typescript
declare global {
  namespace App {
    interface Locals {
      user: {
        name: string;
        id: string;
      };
    }
  }
}

export {};
````

### 3. `resolve` 的進階選項

````javascript
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    // HTML 轉換
    transformPageChunk: ({ html }) => html.replace('舊內容', '新內容'),
    
    // 過濾序列化的響應頭
    filterSerializedResponseHeaders: (name) => name.startsWith('x-'),
    
    // 預載入控制
    preload: ({ type, path }) => type === 'js' || path.includes('/important/')
  });

  return response;
}
````

### 4. `handleFetch` - 修改 fetch 請求

允許您修改或替換在服務端運行的 `load` 或 `action` 函數中的 `fetch` 請求。

````javascript
/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch }) {
  // 重定向 API 請求到內部服務
  if (request.url.startsWith('https://api.yourapp.com/')) {
    request = new Request(
      request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
      request
    );
  }

  return fetch(request);
}
````

#### 處理認證憑據

````javascript
// filepath: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ event, request, fetch }) {
  // 手動添加 cookie 到跨域請求
  if (request.url.startsWith('https://api.my-domain.com/')) {
    request.headers.set('cookie', event.request.headers.get('cookie'));
  }

  return fetch(request);
}
````

---

## 🌐 共享 Hooks

這些 hooks 可以同時在服務端和客戶端使用。

### 1. `handleError` - 錯誤處理

處理應用程式中的意外錯誤。

````javascript
hooks.server.js
/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
  const errorId = crypto.randomUUID();

  // 發送錯誤到監控服務（如 Sentry）
  console.error(`Error ${errorId}:`, error);

  return {
    message: '哎呀！發生了錯誤',
    errorId
  };
}
````

````javascript
/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event, status, message }) {
  const errorId = crypto.randomUUID();
  
  console.error(`Client Error ${errorId}:`, error);

  return {
    message: '哎呀！發生了錯誤',
    errorId
  };
}
````

#### 自定義錯誤介面

````typescript
declare global {
  namespace App {
    interface Error {
      message: string;
      errorId: string;
      timestamp?: string;
    }
  }
}

export {};
````

### 2. `init` - 初始化

在應用程式啟動時執行一次，用於初始化工作。

````javascript
import * as db from '$lib/server/database';

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
  await db.connect();
  console.log('資料庫連接已建立');
}
````

````javascript
/** @type {import('@sveltejs/kit').ClientInit} */
export async function init() {
  // 客戶端初始化
  console.log('客戶端應用程式已啟動');
}
````

---

## 🔄 通用 Hooks

這些 hooks 在服務端和客戶端都會執行。

### 1. `reroute` - 路由重寫

在 `handle` 之前執行，允許您更改 URL 如何轉換為路由。

````javascript
/** @type {Record<string, string>} */
const translated = {
  '/en/about': '/en/about',
  '/zh-tw/關於我們': '/zh-tw/about',
  '/ja/について': '/ja/about'
};

/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
  if (url.pathname in translated) {
    return translated[url.pathname];
  }
}
````

### 2. `transport` - 資料傳輸

跨服務端/客戶端邊界傳遞自定義類型。

````javascript
import { Vector } from '$lib/math';

/** @type {import('@sveltejs/kit').Transport} */
export const transport = {
  Vector: {
    encode: (value) => value instanceof Vector && [value.x, value.y],
    decode: ([x, y]) => new Vector(x, y)
  },
  Date: {
    encode: (value) => value instanceof Date && value.getTime(),
    decode: (timestamp) => new Date(timestamp)
  }
};
````

---

## 🔧 實際應用範例

### 完整的驗證系統

````javascript
import jwt from 'jsonwebtoken';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // 從 cookie 獲取 token
  const token = event.cookies.get('auth-token');
  
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      event.locals.user = user;
    } catch (error) {
      // Token 無效，清除 cookie
      event.cookies.delete('auth-token');
    }
  }

  // 保護特定路由
  if (event.url.pathname.startsWith('/admin') && !event.locals.user?.isAdmin) {
    return new Response('Forbidden', { status: 403 });
  }

  const response = await resolve(event);
  return response;
}
````

### 多個 Handle 函數組合

````javascript
import { sequence } from '@sveltejs/kit/hooks';

async function authentication({ event, resolve }) {
  // 驗證邏輯
  return resolve(event);
}

async function logging({ event, resolve }) {
  console.log(`${event.request.method} ${event.url.pathname}`);
  return resolve(event);
}

async function cors({ event, resolve }) {
  const response = await resolve(event);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

export const handle = sequence(authentication, logging, cors);
````

### 國際化支援

````javascript
/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
  // 支援多語言路由
  const lang = url.pathname.split('/')[1];
  const supportedLangs = ['en', 'zh-tw', 'ja'];
  
  if (supportedLangs.includes(lang)) {
    return url.pathname;
  }
  
  // 預設重定向到英文
  return `/en${url.pathname}`;
}
````

這個 Hooks 系統提供了強大的應用程式控制能力，從請求處理到錯誤管理，從資料傳輸到路由重寫，讓您能夠打造高度客製化的 SvelteKit 應用程式！
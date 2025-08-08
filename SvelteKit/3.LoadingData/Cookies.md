# Cookies 教學

## 概述

在 SvelteKit 中，服務端 `load` 函數可以通過 `cookies` 參數來獲取和設置 HTTP cookies。這對於管理用户會話、偏好設置和身份驗證狀態非常有用。

## 基本用法

### 獲取 Cookies

````javascript
// src/routes/+layout.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
  // 獲取會話 ID
  const sessionid = cookies.get('sessionid');
  
  // 獲取用户偏好
  const theme = cookies.get('theme') || 'light';
  const language = cookies.get('language') || 'en';

  let user = null;
  if (sessionid) {
    user = await db.getUser(sessionid);
  }

  return {
    user,
    preferences: {
      theme,
      language
    }
  };
}
````

### 設置 Cookies

````javascript
// src/routes/login/+page.server.js
import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

/** @type {import('./$types').Actions} */
export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    const user = await auth.authenticate(email, password);
    
    if (!user) {
      return {
        error: 'Invalid credentials'
      };
    }

    // 設置會話 cookie
    cookies.set('sessionid', user.sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // 設置用户偏好
    cookies.set('theme', user.preferences.theme, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });

    redirect(303, '/dashboard');
  }
};
````

## Cookie 選項詳解

### 基本選項

````javascript
export async function load({ cookies }) {
  cookies.set('name', 'value', {
    // 路徑 - cookie 的有效路徑
    path: '/',
    
    // 域名 - cookie 的有效域名
    domain: '.example.com',
    
    // 過期時間（秒）
    maxAge: 60 * 60 * 24, // 24 hours
    
    // 或者使用具體日期
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    
    // 僅 HTTP - 防止 JavaScript 訪問
    httpOnly: true,
    
    // 安全連接 - 僅在 HTTPS 下發送
    secure: true,
    
    // SameSite 設置
    sameSite: 'strict' // 'strict' | 'lax' | 'none'
  });
}
````

### 刪除 Cookies

````javascript
// src/routes/logout/+page.server.js
/** @type {import('./$types').Actions} */
export const actions = {
  logout: async ({ cookies }) => {
    // 刪除會話 cookie
    cookies.delete('sessionid', { path: '/' });
    
    // 或者設置過期時間為過去
    cookies.set('sessionid', '', {
      path: '/',
      expires: new Date(0)
    });

    redirect(303, '/');
  }
};
````

## 實際應用範例

### 用户認證系統

````javascript
// src/lib/server/auth.js
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export function createSession(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifySession(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
````

````javascript
// src/routes/+layout.server.js
import { verifySession } from '$lib/server/auth';
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
  const token = cookies.get('auth-token');
  
  if (!token) {
    return { user: null };
  }

  const payload = verifySession(token);
  if (!payload) {
    // 無效 token，刪除 cookie
    cookies.delete('auth-token', { path: '/' });
    return { user: null };
  }

  const user = await db.getUserById(payload.userId);
  if (!user) {
    cookies.delete('auth-token', { path: '/' });
    return { user: null };
  }

  return { user };
}
````

### 用户偏好管理

````javascript
// src/routes/settings/+page.server.js
/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
  return {
    preferences: {
      theme: cookies.get('theme') || 'system',
      language: cookies.get('language') || 'en',
      notifications: cookies.get('notifications') === 'true',
      timezone: cookies.get('timezone') || 'UTC'
    }
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  updatePreferences: async ({ request, cookies }) => {
    const data = await request.formData();
    
    const preferences = {
      theme: data.get('theme'),
      language: data.get('language'),
      notifications: data.get('notifications') === 'on',
      timezone: data.get('timezone')
    };

    // 設置偏好 cookies（1年有效期）
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    };

    cookies.set('theme', preferences.theme, cookieOptions);
    cookies.set('language', preferences.language, cookieOptions);
    cookies.set('notifications', preferences.notifications.toString(), cookieOptions);
    cookies.set('timezone', preferences.timezone, cookieOptions);

    return { success: true };
  }
};
````

### 購物車功能

````javascript
// src/lib/server/cart.js
export function getCartFromCookie(cartCookie) {
  if (!cartCookie) return { items: [], total: 0 };
  
  try {
    return JSON.parse(cartCookie);
  } catch {
    return { items: [], total: 0 };
  }
}

export function setCartCookie(cookies, cart) {
  cookies.set('cart', JSON.stringify(cart), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax'
  });
}
````

````javascript
// src/routes/shop/+layout.server.js
import { getCartFromCookie } from '$lib/server/cart';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
  const cart = getCartFromCookie(cookies.get('cart'));
  
  return { cart };
}
````

````javascript
// src/routes/api/cart/add/+server.js
import { json } from '@sveltejs/kit';
import { getCartFromCookie, setCartCookie } from '$lib/server/cart';

export async function POST({ request, cookies }) {
  const { productId, quantity } = await request.json();
  
  const cart = getCartFromCookie(cookies.get('cart'));
  
  // 添加或更新商品
  const existingItem = cart.items.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }
  
  // 重新計算總計
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // 更新 cookie
  setCartCookie(cookies, cart);
  
  return json(cart);
}
````

## Cookie 傳遞規則

### 自動傳遞條件

SvelteKit 的 `fetch` 函數會自動傳遞 cookies，但有特定規則：

````javascript
// 如果你的應用運行在 my.domain.com

// ✅ 會接收 cookies
await fetch('/api/data');                    // 同域
await fetch('https://my.domain.com/api');    // 完全匹配
await fetch('https://sub.my.domain.com/api'); // 子域

// ❌ 不會接收 cookies  
await fetch('https://domain.com/api');       // 父域
await fetch('https://api.domain.com/api');   // 平行域
await fetch('https://other.com/api');        // 不同域
````

### 手動處理 Cookie 傳遞

````javascript
// src/hooks.server.js
export async function handleFetch({ event, request, fetch }) {
  // 為特定 API 手動添加認證
  if (request.url.startsWith('https://api.external.com/')) {
    const authToken = event.cookies.get('auth-token');
    if (authToken) {
      request.headers.set('Authorization', `Bearer ${authToken}`);
    }
  }

  return fetch(request);
}
````

## 安全最佳實踐

### 1. 敏感信息使用 HttpOnly

````javascript
// ✅ 安全的會話 cookie
cookies.set('session', sessionToken, {
  httpOnly: true,    // 防止 JavaScript 訪問
  secure: true,      // 僅 HTTPS
  sameSite: 'strict', // 防止 CSRF
  path: '/'
});

// ❌ 避免在普通 cookie 中存儲敏感信息
cookies.set('user-data', JSON.stringify(userData)); // 可被 JS 訪問
````

### 2. 使用適當的 SameSite 設置

````javascript
// 嚴格模式 - 最安全，但可能影響用户體驗
cookies.set('auth', token, { sameSite: 'strict' });

// 寬鬆模式 - 平衡安全和可用性
cookies.set('preferences', settings, { sameSite: 'lax' });

// 無限制 - 僅在必要時使用，需要 secure: true
cookies.set('tracking', id, { 
  sameSite: 'none', 
  secure: true 
});
````

### 3. 設置合適的過期時間

````javascript
// 不同類型的 cookie 使用不同的過期時間
const cookieOptions = {
  // 會話類 - 較短時間
  session: { maxAge: 60 * 60 * 24 }, // 1 day
  
  // 記住我 - 中等時間
  remember: { maxAge: 60 * 60 * 24 * 30 }, // 30 days
  
  // 偏好設置 - 較長時間
  preferences: { maxAge: 60 * 60 * 24 * 365 }, // 1 year
  
  // 追蹤類 - 根據法規設置
  analytics: { maxAge: 60 * 60 * 24 * 90 } // 90 days
};
````

## 錯誤處理

### Cookie 大小限制

````javascript
export async function load({ cookies }) {
  try {
    const largeData = JSON.stringify(someObject);
    
    // 檢查大小（瀏覽器限制通常是 4KB）
    if (largeData.length > 4000) {
      console.warn('Cookie data too large, using session storage instead');
      // 使用服務端會話存儲替代
      const sessionId = generateSessionId();
      await storeInSession(sessionId, someObject);
      cookies.set('session-id', sessionId, { httpOnly: true });
    } else {
      cookies.set('data', largeData);
    }
  } catch (error) {
    console.error('Failed to set cookie:', error);
  }
}
````

### Cookie 讀取錯誤

````javascript
export async function load({ cookies }) {
  const rawData = cookies.get('user-data');
  
  if (!rawData) {
    return { userData: null };
  }

  try {
    const userData = JSON.parse(rawData);
    return { userData };
  } catch (error) {
    // 損壞的 cookie 數據，刪除它
    cookies.delete('user-data', { path: '/' });
    console.error('Invalid cookie data:', error);
    return { userData: null };
  }
}
````

## 開發和調試

### Cookie 調試工具

````javascript
// src/lib/server/debug.js
export function debugCookies(cookies) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Current cookies:', {
      sessionId: cookies.get('sessionid'),
      theme: cookies.get('theme'),
      cartItems: cookies.get('cart')?.length || 0
    });
  }
}

// 在 load 函數中使用
export async function load({ cookies }) {
  debugCookies(cookies);
  // ... 其他邏輯
}
````

### 本地開發設置

````javascript
// src/routes/+layout.server.js
export async function load({ cookies, url }) {
  // 開發環境下的特殊處理
  if (process.env.NODE_ENV === 'development') {
    // 本地開發時不使用 secure flag
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      sameSite: 'lax'
      // secure: false for local development
    };
  } else {
    // 生產環境使用完整安全設置
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    };
  }
}
````

Cookies 在 SvelteKit 中提供了強大的狀態管理能力，正確使用可以大大改善用户體驗，同時保持應用的安全性。
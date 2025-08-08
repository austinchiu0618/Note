## SvelteKit 服務端 Hook 完整教學

### 核心概念

**服務端 Hook** 是在 `src/hooks.server.js` 中定義的函數，它們：
- **只在服務端執行**（Node.js 環境或部署平台）
- **攔截每個 HTTP 請求**
- **在路由處理之前執行**
- **可以修改請求和響應**

### 主要的服務端 Hook 函數

#### 1. `handle` - 請求攔截器

**執行時機**：每個 HTTP 請求到達時
**作用**：請求預處理、身份驗證、響應修改

````javascript
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // event: 包含請求信息的對象
    // resolve: 處理請求並返回響應的函數
    
    // 在路由處理之前執行的邏輯
    console.log('收到請求:', event.url.pathname);
    
    // 調用 resolve 處理路由
    const response = await resolve(event);
    
    // 在響應返回之前執行的邏輯
    console.log('響應狀態:', response.status);
    
    return response;
}
````

#### 2. `handleError` - 錯誤處理器

**執行時機**：服務端發生未捕獲錯誤時
**作用**：錯誤日誌記錄、錯誤報告

````javascript
/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
    // 記錄詳細錯誤信息
    console.error('服務端錯誤:', {
        message: error.message,
        stack: error.stack,
        url: event.url.pathname,
        method: event.request.method,
        userAgent: event.request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
    });
    
    // 發送錯誤到監控服務（如 Sentry）
    if (typeof Sentry !== 'undefined') {
        Sentry.captureException(error, {
            extra: {
                url: event.url.pathname,
                method: event.request.method
            }
        });
    }
    
    // 返回用戶友好的錯誤信息
    return {
        message: status === 500 ? '服務器內部錯誤' : message,
        code: error.code || 'UNKNOWN_ERROR'
    };
}
````

#### 3. `handleFetch` - Fetch 攔截器

**執行時機**：在服務端使用 `fetch()` 時
**作用**：修改 fetch 請求、添加認證

````javascript
/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ event, request, fetch }) {
    // 攔截對內部 API 的請求
    if (request.url.startsWith('http://localhost:5173/api/')) {
        // 添加認證標頭
        request.headers.set('Authorization', `Bearer ${event.locals.token}`);
        
        // 添加內部服務標識
        request.headers.set('X-Internal-Request', 'true');
    }
    
    // 攔截對外部 API 的請求
    if (request.url.startsWith('https://api.external-service.com/')) {
        // 添加 API 密鑰
        request.headers.set('X-API-Key', process.env.EXTERNAL_API_KEY);
    }
    
    return fetch(request);
}
````

### 完整實際應用範例

#### 1. 身份驗證與授權系統

````javascript
import jwt from 'jsonwebtoken';
import { redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 1. 提取認證信息
    const token = event.cookies.get('auth-token') || 
                  event.request.headers.get('authorization')?.replace('Bearer ', '');
    
    // 2. 驗證 JWT token
    if (token) {
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            event.locals.user = payload;
            event.locals.isAuthenticated = true;
        } catch (error) {
            console.warn('無效的 JWT token:', error.message);
            // 清除無效的 cookie
            event.cookies.delete('auth-token', { path: '/' });
            event.locals.isAuthenticated = false;
        }
    } else {
        event.locals.isAuthenticated = false;
    }
    
    // 3. 路由保護
    const protectedRoutes = ['/dashboard', '/admin', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route => 
        event.url.pathname.startsWith(route)
    );
    
    if (isProtectedRoute && !event.locals.isAuthenticated) {
        // 重導向到登入頁面
        throw redirect(302, `/login?redirect=${encodeURIComponent(event.url.pathname)}`);
    }
    
    // 4. 角色權限檢查
    if (event.url.pathname.startsWith('/admin')) {
        if (!event.locals.user?.roles?.includes('admin')) {
            throw redirect(302, '/unauthorized');
        }
    }
    
    // 5. 處理請求
    const response = await resolve(event);
    
    // 6. 添加安全標頭
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // 7. CORS 處理（如果需要）
    if (event.request.method === 'OPTIONS') {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    return response;
}
````

#### 2. 請求日誌與監控

````javascript
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // 添加請求 ID 到 locals
    event.locals.requestId = requestId;
    
    // 記錄請求開始
    console.log(`[${requestId}] 請求開始: ${event.request.method} ${event.url.pathname}`);
    
    try {
        const response = await resolve(event);
        const duration = Date.now() - startTime;
        
        // 記錄成功響應
        console.log(`[${requestId}] 請求完成: ${response.status} (${duration}ms)`);
        
        // 添加響應標頭
        response.headers.set('X-Request-ID', requestId);
        response.headers.set('X-Response-Time', `${duration}ms`);
        
        return response;
    } catch (error) {
        const duration = Date.now() - startTime;
        
        // 記錄錯誤響應
        console.error(`[${requestId}] 請求失敗: ${error.message} (${duration}ms)`);
        
        throw error;
    }
}
````

#### 3. API 代理與快取

````javascript
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // API 代理：重寫內部 API 路徑
    if (event.url.pathname.startsWith('/api/proxy/')) {
        const targetPath = event.url.pathname.replace('/api/proxy/', '');
        const targetUrl = `https://external-api.com/${targetPath}${event.url.search}`;
        
        try {
            const response = await fetch(targetUrl, {
                method: event.request.method,
                headers: {
                    ...Object.fromEntries(event.request.headers),
                    'X-API-Key': process.env.EXTERNAL_API_KEY
                },
                body: event.request.method !== 'GET' ? await event.request.text() : undefined
            });
            
            return new Response(await response.text(), {
                status: response.status,
                headers: {
                    'Content-Type': response.headers.get('Content-Type') || 'application/json',
                    'Cache-Control': 'public, max-age=300' // 5 分鐘快取
                }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'API 代理錯誤' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
    
    return resolve(event);
}
````

#### 4. 多租戶系統

````javascript
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // 從子域名或路徑提取租戶信息
    const host = event.request.headers.get('host') || '';
    const subdomain = host.split('.')[0];
    
    // 或從路徑提取租戶
    const pathMatch = event.url.pathname.match(/^\/tenant\/([^\/]+)/);
    const tenantId = pathMatch ? pathMatch[1] : subdomain;
    
    if (tenantId && tenantId !== 'www' && tenantId !== 'localhost') {
        // 驗證租戶存在性
        const tenant = await getTenantInfo(tenantId);
        
        if (!tenant) {
            return new Response('租戶不存在', { status: 404 });
        }
        
        if (!tenant.active) {
            return new Response('租戶已停用', { status: 403 });
        }
        
        // 設置租戶上下文
        event.locals.tenant = tenant;
        event.locals.tenantId = tenantId;
        
        // 設置租戶資料庫連接
        event.locals.db = getTenantDatabase(tenantId);
    }
    
    return resolve(event);
}

async function getTenantInfo(tenantId) {
    // 從主資料庫獲取租戶信息
    // 這裡應該實現實際的資料庫查詢
    return {
        id: tenantId,
        name: `${tenantId} 公司`,
        active: true,
        plan: 'premium'
    };
}
````

### Event 對象詳解

`handle` 函數接收的 `event` 對象包含豐富的請求信息：

````javascript
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // URL 信息
    console.log('URL:', event.url.href);
    console.log('路徑:', event.url.pathname);
    console.log('查詢參數:', event.url.searchParams);
    
    // 請求信息
    console.log('方法:', event.request.method);
    console.log('標頭:', Object.fromEntries(event.request.headers));
    
    // 路由參數（在路由解析後可用）
    console.log('參數:', event.params);
    
    // Cookie 操作
    const sessionId = event.cookies.get('session-id');
    event.cookies.set('last-visit', new Date().toISOString(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 天
    });
    
    // 本地變數（可在後續的 load 函數中使用）
    event.locals.startTime = Date.now();
    event.locals.userIP = event.getClientAddress();
    
    return resolve(event);
}
````

### 最佳實踐建議

1. **性能考慮**：避免在 `handle` 中執行耗時操作
2. **錯誤處理**：妥善處理異步操作的錯誤
3. **安全性**：驗證所有輸入，設置適當的安全標頭
4. **日誌記錄**：記錄關鍵操作以便除錯和監控
5. **測試**：為 Hook 函數編寫單元測試

````javascript
// 測試範例
import { handle } from './hooks.server.js';
import { describe, test, expect } from 'vitest';

describe('服務端 Hook 測試', () => {
    test('應該為受保護路由重導向未認證用戶', async () => {
        const event = {
            url: new URL('http://localhost/dashboard'),
            request: new Request('http://localhost/dashboard'),
            cookies: { get: () => null },
            locals: {}
        };
        
        const resolve = () => new Response('OK');
        
        const response = await handle({ event, resolve });
        expect(response.status).toBe(302);
    });
});
````

服務端 Hook 是 SvelteKit 中控制服務端行為的核心機制，正確使用能大大增強應用的安全性、可維護性和功能性。

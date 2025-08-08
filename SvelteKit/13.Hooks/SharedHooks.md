## 共享 Hook 完整教學

### 核心概念

**共享 Hook** 是指可以**同時在服務端和客戶端**使用的 Hook 函數，這些函數：
- 可以放在 `src/hooks.server.js`（服務端執行）
- 可以放在 `src/hooks.client.js`（客戶端執行）
- **相同的邏輯，不同的執行環境**

### 主要的共享 Hook 函數

#### 1. `handleError` - 錯誤處理器

**作用**：處理應用程序中的意外錯誤
**執行時機**：當拋出未捕獲的錯誤時

#### 服務端錯誤處理

````javascript
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: process.env.NODE_ENV
});

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
    const errorId = crypto.randomUUID();
    
    // 詳細的服務端錯誤記錄
    console.error('服務端錯誤:', {
        errorId,
        message: error.message,
        stack: error.stack,
        url: event.url.pathname,
        method: event.request.method,
        userAgent: event.request.headers.get('user-agent'),
        userId: event.locals.user?.id,
        timestamp: new Date().toISOString(),
        status
    });
    
    // 發送到錯誤監控服務
    Sentry.captureException(error, {
        tags: {
            component: 'server',
            url: event.url.pathname
        },
        extra: {
            event,
            errorId,
            status,
            userId: event.locals.user?.id
        },
        user: {
            id: event.locals.user?.id,
            ip_address: event.getClientAddress()
        }
    });
    
    // 返回用戶安全的錯誤信息
    return {
        message: status === 500 ? '服務器內部錯誤，我們正在修復中' : message,
        errorId,
        timestamp: new Date().toISOString()
    };
}
````

#### 客戶端錯誤處理

````javascript
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: import.meta.env.MODE
});

/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event, status, message }) {
    const errorId = crypto.randomUUID();
    
    // 客戶端錯誤記錄
    console.error('客戶端錯誤:', {
        errorId,
        message: error.message,
        stack: error.stack,
        url: event.url.pathname,
        route: event.route?.id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        status
    });
    
    // 發送到錯誤監控服務
    Sentry.captureException(error, {
        tags: {
            component: 'client',
            url: event.url.pathname
        },
        extra: {
            event,
            errorId,
            status,
            route: event.route?.id
        },
        user: {
            id: getStoredUserId() // 從 localStorage 或其他地方獲取
        }
    });
    
    // 顯示用戶友好的錯誤信息
    showErrorToast({
        message: '糟糕！出現了錯誤，請重試',
        errorId,
        canRetry: status !== 404
    });
    
    return {
        message: '應用程序遇到問題，請重新整理頁面',
        errorId,
        timestamp: new Date().toISOString()
    };
}

function getStoredUserId() {
    try {
        return localStorage.getItem('userId');
    } catch {
        return null;
    }
}

function showErrorToast({ message, errorId, canRetry }) {
    // 實現錯誤提示邏輯
    // 這可以是一個自定義的 toast 組件
}
````

#### 2. `init` - 初始化函數

**作用**：在應用啟動時執行一次性初始化
**執行時機**：應用程序啟動時

#### 服務端初始化

````javascript
import * as db from '$lib/server/database';
import * as cache from '$lib/server/cache';
import { logger } from '$lib/server/logger';

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
    logger.info('開始服務端初始化');
    
    try {
        // 初始化資料庫連接
        await db.connect();
        logger.info('資料庫連接成功');
        
        // 初始化 Redis 快取
        await cache.connect();
        logger.info('快取連接成功');
        
        // 預載必要的配置
        await loadServerConfig();
        logger.info('服務端配置載入完成');
        
        // 啟動背景任務
        startBackgroundJobs();
        logger.info('背景任務啟動完成');
        
        logger.info('服務端初始化完成');
    } catch (error) {
        logger.error('服務端初始化失敗:', error);
        throw error; // 讓應用程序知道初始化失敗
    }
}

async function loadServerConfig() {
    // 從資料庫或配置文件載入設定
    global.serverConfig = await db.getConfig();
}

function startBackgroundJobs() {
    // 啟動定期任務
    setInterval(async () => {
        await cleanupExpiredSessions();
    }, 60 * 60 * 1000); // 每小時清理一次
}
````

#### 客戶端初始化

````javascript
import { browser } from '$app/environment';
import { initAnalytics } from '$lib/analytics';
import { setupPerformanceMonitoring } from '$lib/performance';

/** @type {import('@sveltejs/kit').ClientInit} */
export async function init() {
    if (!browser) return; // 確保在瀏覽器中執行
    
    console.log('開始客戶端初始化');
    
    try {
        // 初始化分析工具
        await initAnalytics();
        console.log('分析工具初始化完成');
        
        // 設置性能監控
        setupPerformanceMonitoring();
        console.log('性能監控設置完成');
        
        // 初始化用戶偏好設定
        await loadUserPreferences();
        console.log('用戶偏好設定載入完成');
        
        // 設置全局事件監聽器
        setupGlobalEventListeners();
        console.log('全局事件監聽器設置完成');
        
        // 檢查和更新應用版本
        await checkAppVersion();
        console.log('應用版本檢查完成');
        
        console.log('客戶端初始化完成');
    } catch (error) {
        console.error('客戶端初始化失敗:', error);
        // 客戶端初始化失敗通常不應該阻止應用程序運行
    }
}

async function loadUserPreferences() {
    try {
        const preferences = localStorage.getItem('userPreferences');
        if (preferences) {
            window.userPreferences = JSON.parse(preferences);
        } else {
            window.userPreferences = getDefaultPreferences();
        }
    } catch (error) {
        console.warn('載入用戶偏好失敗，使用預設值:', error);
        window.userPreferences = getDefaultPreferences();
    }
}

function setupGlobalEventListeners() {
    // 監聽網路狀態變化
    window.addEventListener('online', () => {
        console.log('網路連接恢復');
        showNetworkStatus('online');
    });
    
    window.addEventListener('offline', () => {
        console.log('網路連接斷開');
        showNetworkStatus('offline');
    });
    
    // 監聽頁面可見性變化
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // 頁面變為可見時，檢查更新
            checkForUpdates();
        }
    });
}

async function checkAppVersion() {
    try {
        const response = await fetch('/api/version');
        const { version } = await response.json();
        
        const currentVersion = localStorage.getItem('appVersion');
        if (currentVersion && currentVersion !== version) {
            showUpdateNotification();
        }
        
        localStorage.setItem('appVersion', version);
    } catch (error) {
        console.warn('檢查應用版本失敗:', error);
    }
}
````

### 錯誤類型定義

為了更好的類型安全，可以自定義錯誤接口：

````typescript
declare global {
    namespace App {
        interface Error {
            message: string;
            errorId: string;
            timestamp: string;
            code?: string;
            retryable?: boolean;
        }
        
        interface Locals {
            user?: {
                id: string;
                name: string;
                role: string;
            };
            requestId: string;
            startTime: number;
        }
    }
}

export {};
````

### 完整的錯誤處理範例

#### 統一的錯誤處理邏輯

````javascript
export function createErrorHandler(isServer = false) {
    return async function handleError({ error, event, status, message }) {
        const errorId = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        
        // 構建基本錯誤信息
        const errorInfo = {
            errorId,
            timestamp,
            message: error.message,
            stack: error.stack,
            status,
            environment: isServer ? 'server' : 'client',
            url: event.url.pathname,
            userAgent: isServer 
                ? event.request.headers.get('user-agent')
                : navigator.userAgent
        };
        
        // 添加環境特定信息
        if (isServer) {
            errorInfo.method = event.request.method;
            errorInfo.userId = event.locals.user?.id;
            errorInfo.requestId = event.locals.requestId;
            errorInfo.ip = event.getClientAddress();
        } else {
            errorInfo.route = event.route?.id;
            errorInfo.viewport = `${window.innerWidth}x${window.innerHeight}`;
            errorInfo.online = navigator.onLine;
        }
        
        // 記錄錯誤
        console.error(`${isServer ? '服務端' : '客戶端'}錯誤:`, errorInfo);
        
        // 發送到監控服務
        await sendErrorToMonitoring(errorInfo);
        
        // 返回用戶安全的錯誤信息
        return {
            message: getUserFriendlyMessage(status, error),
            errorId,
            timestamp,
            retryable: isRetryableError(error, status)
        };
    };
}

function getUserFriendlyMessage(status, error) {
    if (status === 404) return '頁面未找到';
    if (status === 403) return '無權限訪問';
    if (status === 500) return '服務器內部錯誤，請稍後重試';
    if (error.name === 'NetworkError') return '網路連接錯誤，請檢查網路狀態';
    return '應用程序遇到問題，請重試';
}

function isRetryableError(error, status) {
    // 網路錯誤通常可以重試
    if (error.name === 'NetworkError') return true;
    // 5xx 錯誤通常可以重試
    if (status >= 500) return true;
    // 4xx 錯誤通常不能重試
    return false;
}

async function sendErrorToMonitoring(errorInfo) {
    try {
        // 這裡可以發送到 Sentry、LogRocket 等監控服務
        await fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorInfo)
        });
    } catch (monitoringError) {
        console.warn('發送錯誤到監控服務失敗:', monitoringError);
    }
}
````

#### 使用統一的錯誤處理

````javascript
import { createErrorHandler } from '$lib/shared/error-handler.js';

export const handleError = createErrorHandler(true); // 服務端

// filepath: src/hooks.client.js
import { createErrorHandler } from '$lib/shared/error-handler.js';

export const handleError = createErrorHandler(false); // 客戶端
````

### 最佳實踐建議

1. **環境區分**：根據執行環境調整錯誤處理邏輯
2. **用戶體驗**：客戶端錯誤應提供更好的用戶反饋
3. **安全性**：服務端錯誤不應洩露敏感信息
4. **監控集成**：整合專業的錯誤監控服務
5. **可重試性**：區分可重試和不可重試的錯誤
6. **性能考慮**：避免在 `init` 中執行過於耗時的操作

**共享 Hook** 讓您能夠以統一的方式處理服務端和客戶端的錯誤，同時根據不同的執行環境進行適當的調整，是構建健壯應用程序的關鍵機制。
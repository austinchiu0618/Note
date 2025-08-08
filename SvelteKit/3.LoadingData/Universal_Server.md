# Universal load vs server load

## 概述

SvelteKit 提供兩種類型的 `load` 函數：
- **Universal load** (`+page.js`, `+layout.js`) - 可在服務端和瀏覽器運行
- **Server load** (`+page.server.js`, `+layout.server.js`) - 僅在服務端運行

## 基本差異

### Universal Load Functions

````javascript
// src/routes/blog/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	const response = await fetch(`/api/posts/${params.slug}`);
	return {
		post: await response.json()
	};
}
````

**特點：**
- 在 SSR 期間於服務端運行
- 在 hydration 時於瀏覽器運行
- 客户端導航時僅在瀏覽器運行
- 可以返回任何 JavaScript 值（函數、類別、組件等）

### Server Load Functions

````javascript
// src/routes/blog/+page.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
````

**特點：**
- 永遠只在服務端運行
- 可以存取伺服器專用資源（資料庫、檔案系統、環境變數）
- 返回值必須可序列化
- 更安全，私有資料不會暴露給客户端

## 執行時機

### Universal Load 執行流程

```
首次訪問：
用户請求 → SSR 在服務端執行 → HTML 傳送 → Hydration 在客户端執行

客户端導航：
路由變化 → 僅在瀏覽器執行
```

### Server Load 執行流程

```
任何時候：
請求 → 永遠在服務端執行 → 序列化結果傳送
```

## 輸入參數差異

### Universal Load 可用參數

````javascript
/** @type {import('./$types').PageLoad} */
export function load({
	params,          // 路由參數
	route,           // 路由資訊
	url,             // URL 物件
	fetch,           // 增強的 fetch 函數
	setHeaders,      // 設置回應標頭
	parent,          // 父級 load 數據
	depends,         // 聲明依賴
	untrack,         // 取消依賴追蹤
	data             // 來自 server load 的數據（如果存在）
}) {
	// 實作邏輯
}
````

### Server Load 額外參數

````javascript
/** @type {import('./$types').PageServerLoad} */
export function load({
	// Universal Load 的所有參數，加上：
	request,         // 原始請求物件
	cookies,         // Cookie 操作
	locals,          // 伺服器端狀態
	clientAddress,   // 客户端 IP
	platform         // 部署平台特定資料
}) {
	// 實作邏輯
}
````

## 輸出限制

### Universal Load 輸出

````javascript
// ✅ 可以返回任何 JavaScript 值
export function load() {
	return {
		// 普通數據
		message: 'Hello',
		
		// 函數
		formatter: (text) => text.toUpperCase(),
		
		// 類別實例
		utils: new DateUtils(),
		
		// Svelte 組件
		DynamicComponent: SomeComponent
	};
}
````

### Server Load 輸出

````javascript
// ✅ 可序列化的數據
export function load() {
	return {
		// JSON 可表示的內容
		user: { name: 'John', age: 30 },
		
		// 特殊類型（可序列化）
		date: new Date(),
		regex: /pattern/gi,
		bigint: 123n,
		map: new Map([['key', 'value']]),
		set: new Set([1, 2, 3]),
		
		// Promise（會被流式傳輸）
		asyncData: fetchLargeData()
	};
}

// ❌ 不可序列化的數據
export function load() {
	return {
		// 這些會導致錯誤
		domNode: document.getElementById('app'),
		func: () => {},
		symbol: Symbol('test'),
		classInstance: new CustomClass()
	};
}
````

## 實際應用場景

### 何時使用 Universal Load

#### 1. API 數據獲取（無需私有憑證）

````javascript
// src/routes/weather/+page.js
export async function load({ fetch, url }) {
	const city = url.searchParams.get('city') || 'taipei';
	
	// 公開 API，無需伺服器端處理
	const response = await fetch(
		`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${PUBLIC_API_KEY}`
	);
	
	return {
		weather: await response.json(),
		city
	};
}
````

#### 2. 客户端特定邏輯

````javascript
// src/routes/dashboard/+page.js
export function load({ url }) {
	// 根據客户端能力決定載入的組件
	const supportsWebGL = typeof WebGLRenderingContext !== 'undefined';
	
	return {
		chartComponent: supportsWebGL ? WebGLChart : CanvasChart,
		features: {
			advancedCharts: supportsWebGL,
			realtimeUpdates: 'WebSocket' in globalThis
		}
	};
}
````

#### 3. 混合伺服器和客户端數據

````javascript
// src/routes/profile/+page.server.js
export async function load({ locals }) {
	return {
		serverUser: await getUser(locals.userId)
	};
}

// src/routes/profile/+page.js
export async function load({ data, fetch }) {
	// 結合伺服器數據和客户端 API
	const preferences = await fetch('/api/user-preferences').then(r => r.json());
	
	return {
		user: data.serverUser,
		preferences,
		// 客户端特定功能
		deviceInfo: getDeviceInfo()
	};
}
````

### 何時使用 Server Load

#### 1. 資料庫直接存取

````javascript
// src/routes/admin/users/+page.server.js
import { db } from '$lib/server/database';

export async function load({ locals }) {
	// 直接資料庫查詢，私有操作
	if (!locals.user?.isAdmin) {
		error(403, 'Unauthorized');
	}
	
	const [users, stats] = await Promise.all([
		db.users.findMany({
			include: { profile: true, orders: true }
		}),
		db.users.aggregate({
			_count: true,
			_avg: { age: true }
		})
	]);
	
	return { users, stats };
}
````

#### 2. 私有 API 憑證

````javascript
// src/routes/analytics/+page.server.js
import { PRIVATE_ANALYTICS_KEY } from '$env/static/private';

export async function load() {
	// 使用私有 API 金鑰
	const response = await fetch('https://api.analytics.com/data', {
		headers: {
			'Authorization': `Bearer ${PRIVATE_ANALYTICS_KEY}`
		}
	});
	
	return {
		analytics: await response.json()
	};
}
````

#### 3. 檔案系統操作

````javascript
// src/routes/blog/+page.server.js
import fs from 'fs/promises';
import path from 'path';

export async function load() {
	// 讀取伺服器檔案系統
	const postsDir = path.join(process.cwd(), 'content/posts');
	const files = await fs.readdir(postsDir);
	
	const posts = await Promise.all(
		files.map(async (file) => {
			const content = await fs.readFile(
				path.join(postsDir, file), 
				'utf-8'
			);
			return parseMarkdown(content);
		})
	);
	
	return { posts };
}
````

## 組合使用

### 順序執行

當同一路由同時有 server 和 universal load 時：

````javascript
// src/routes/product/[id]/+page.server.js
export async function load({ params }) {
	const product = await db.getProduct(params.id);
	
	return {
		product,
		// 私有數據，不會暴露給客户端
		internalNotes: product.internalNotes
	};
}

// src/routes/product/[id]/+page.js
export async function load({ data, fetch }) {
	// data 來自 server load
	const { product } = data;
	
	// 獲取客户端特定數據
	const [reviews, recommendations] = await Promise.all([
		fetch(`/api/products/${product.id}/reviews`).then(r => r.json()),
		fetch(`/api/recommendations?productId=${product.id}`).then(r => r.json())
	]);
	
	return {
		// 覆蓋 server data（移除私有資訊）
		product: {
			id: product.id,
			name: product.name,
			price: product.price
			// internalNotes 不會包含在最終數據中
		},
		reviews,
		recommendations
	};
}
````

## 效能考量

### Universal Load 優勢

```
客户端導航時：
路由變化 → 直接在瀏覽器執行 → 無需伺服器往返
```

### Server Load 優勢

```
資料安全性：
私有資料 → 僅在伺服器處理 → 永不暴露給客户端
```

### 混合策略

````javascript
// 基礎數據用 server load
// src/routes/dashboard/+layout.server.js
export async function load({ locals }) {
	return {
		user: locals.user,
		permissions: await getUserPermissions(locals.user.id)
	};
}

// 互動功能用 universal load
// src/routes/dashboard/analytics/+page.js
export async function load({ parent, fetch }) {
	const { permissions } = await parent();
	
	if (!permissions.includes('view-analytics')) {
		error(403, 'Insufficient permissions');
	}
	
	// 客户端可以快速切換圖表類型
	return {
		ChartComponent: await import('$lib/components/AdvancedChart.svelte'),
		chartTypes: ['line', 'bar', 'pie'],
		defaultType: 'line'
	};
}
````

## 選擇準則

### 使用 Server Load 當：
- ✅ 需要存取資料庫或檔案系統
- ✅ 使用私有環境變數或 API 金鑰
- ✅ 處理敏感用户資料
- ✅ 需要伺服器端驗證或授權
- ✅ 執行複雜的伺服器端邏輯

### 使用 Universal Load 當：
- ✅ 從公開 API 獲取資料
- ✅ 需要客户端特定功能
- ✅ 返回無法序列化的內容
- ✅ 優化客户端導航效能
- ✅ 結合伺服器和客户端邏輯

正確選擇和組合這兩種 load 函數類型，可以創建既安全又高效的應用程式。

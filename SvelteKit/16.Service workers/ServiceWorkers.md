# Service Workers

## 🎯 什麼是 Service Worker？

想像一下，Service Worker 就像是你網站的「貼身管家」。它坐在你的網站和網路之間，幫你處理各種請求：

- **網路好的時候**：管家會幫你快速取得資料，同時偷偷備份一份
- **網路斷了的時候**：管家說「沒問題！我這裡有備份」
- **網站更新了**：管家會清理舊的備份，準備新的

### 為什麼需要 Service Worker？

1. **離線功能**：沒有網路也能使用網站
2. **速度提升**：常用的資源直接從快取拿，不用重新下載
3. **更好的體驗**：減少白畫面和載入時間

---

## 📁 在 SvelteKit 中設置 Service Worker

### 超簡單的設置方式

SvelteKit 讓 Service Worker 的設置變得非常簡單：

1. **建立檔案**：在 `src/` 資料夾下建立 `service-worker.js`
2. **寫入邏輯**：SvelteKit 會自動處理其他事情

```javascript
console.log('Service Worker 啟動了！');
```

就這麼簡單！SvelteKit 會自動：
- 打包你的 Service Worker
- 在適當的時候註冊它
- 處理更新機制

### 其他檔案位置選項

```javascript
// 也可以放在這裡
// filepath: src/service-worker/index.js
```

---

## 📦 $service-worker 模組是什麼？

SvelteKit 提供了一個特殊的模組，讓你在 Service Worker 中可以取得應用程式的資訊：

```javascript
import { build, files, version } from '$service-worker';

console.log('應用程式檔案:', build);      // 你的 JS、CSS 等建置檔案
console.log('靜態檔案:', files);         // static 資料夾中的檔案
console.log('版本號:', version);         // 用來區分不同版本的字串
```

### 這些資訊有什麼用？

- **build**：包含你的應用程式需要的所有 JavaScript 和 CSS 檔案
- **files**：包含圖片、字型等靜態資源
- **version**：每次建置都會變化，用來建立獨特的快取名稱

---

## 🗄️ 快取策略解釋

### 基本快取概念

快取就像是把常用的東西放在身邊的抽屜裡，需要時不用跑到倉庫拿。

### 完整的 Service Worker 範例

```javascript
import { build, files, version } from '$service-worker';

// 建立獨特的快取名稱
const CACHE = `my-app-cache-${version}`;

// 要預先快取的所有檔案
const ASSETS = [
	...build,  // 應用程式檔案
	...files   // 靜態檔案
];

// 安裝階段：預先下載並快取重要檔案
self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}
	
	event.waitUntil(addFilesToCache());
});

// 啟動階段：清理舊的快取
self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) {
				await caches.delete(key);
			}
		}
	}
	
	event.waitUntil(deleteOldCaches());
});

// 請求處理：決定從快取還是網路取得資料
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	
	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);
		
		// 如果是應用程式檔案，直接從快取拿
		if (ASSETS.includes(url.pathname)) {
			return await cache.match(url.pathname);
		}
		
		// 其他內容：先試網路，失敗就用快取
		try {
			const response = await fetch(event.request);
			
			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}
			
			return response;
		} catch (err) {
			return await cache.match(event.request);
		}
	}
	
	event.respondWith(respond());
});
```

### 這個策略的運作方式

1. **安裝時**：下載所有重要檔案到快取
2. **啟動時**：刪除舊版本的快取
3. **請求時**：
   - 重要檔案直接從快取拿（超快！）
   - 其他內容先試網路，成功就更新快取
   - 網路失敗就用快取的版本

---

## ⚠️ 快取的注意事項

### 什麼時候要小心？

**過時資料的問題**：有時候舊的資料比沒有資料更糟糕

```javascript
// 例如：股價資訊不適合長時間快取
// 因為過時的股價可能誤導投資決策

// 適合快取的：
// - 圖片、字型、CSS
// - 很少變動的內容
// - 應用程式的基本檔案

// 不適合快取的：
// - 即時資料（股價、天氣）
// - 個人化內容
// - 大型檔案（影片）
```

### 快取大小限制

瀏覽器會在快取太滿時自動清理，所以：
- 不要快取大型影片檔案
- 優先快取重要的、常用的內容
- 定期清理不需要的快取

---

## 🔧 開發環境的特殊設定

### 開發 vs 生產環境

**生產環境**：Service Worker 會被打包成一個檔案
**開發環境**：直接使用原始檔案（需要支援 ES 模組的瀏覽器）

### 手動註冊的方式

如果你想自己控制 Service Worker 的註冊：

```javascript
import { dev } from '$app/environment';

navigator.serviceWorker.register('/service-worker.js', {
	type: dev ? 'module' : 'classic'
});
```

### 開發環境的限制

在開發時，某些功能會不一樣：
- `build` 和 `prerendered` 是空陣列
- 需要支援 ES 模組的瀏覽器
- 可能需要 HTTPS（現代瀏覽器的安全要求）

---

## 📝 TypeScript 支援

### 為什麼需要特殊設定？

Service Worker 運行在特殊的環境中，沒有 DOM（沒有 `document`、`window` 等），需要告訴 TypeScript 這個事實。

### JavaScript 版本

```javascript
/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

// 之後使用 sw 而不是 self
sw.addEventListener('install', (event) => {
	// ...
});
```

### TypeScript 版本

```typescript
// filepath: src/service-worker.ts
/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event) => {
	// ...
});
```

這些設定告訴 TypeScript：
- 這是一個 Service Worker 環境
- 沒有 DOM 相關的類型
- 可以使用現代 JavaScript 功能
- `self` 指的是 Service Worker 的全域環境

---

## 🛠️ 進階解決方案

### 何時考慮其他工具？

SvelteKit 的 Service Worker 支援是「低階」的，給你完全的控制權。但如果你想要：

- **自動的快取策略**
- **背景同步**
- **推送通知**
- **更複雜的離線功能**

可以考慮使用：

**Vite PWA 插件**：
- 自動產生 Service Worker
- 多種快取策略可選
- 整合 Workbox（Google 的 PWA 工具包）

**Workbox**：
- Google 開發的 PWA 工具包
- 提供預設的最佳實踐
- 豐富的快取策略

### 選擇建議

- **簡單需求**：使用 SvelteKit 內建支援
- **複雜 PWA**：考慮 Vite PWA 插件
- **企業級應用**：使用 Workbox

---

## 🎯 實際應用場景

### 部落格網站

```javascript
// 快取文章內容，讓讀者離線也能閱讀
const CACHE_ARTICLES = 'articles-v1';

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	
	// 如果是文章頁面
	if (url.pathname.startsWith('/blog/')) {
		event.respondWith(
			caches.match(event.request).then(response => {
				// 有快取就用快取，同時更新
				if (response) {
					fetch(event.request).then(freshResponse => {
						caches.open(CACHE_ARTICLES).then(cache => {
							cache.put(event.request, freshResponse);
						});
					});
					return response;
				}
				
				// 沒快取就從網路拿，並加入快取
				return fetch(event.request).then(response => {
					const responseClone = response.clone();
					caches.open(CACHE_ARTICLES).then(cache => {
						cache.put(event.request, responseClone);
					});
					return response;
				});
			})
		);
	}
});
```

### 電商網站

```javascript
// 產品圖片永久快取，API 資料短期快取
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	
	// 產品圖片
	if (url.pathname.includes('/product-images/')) {
		event.respondWith(
			caches.match(event.request).then(response => {
				return response || fetch(event.request);
			})
		);
	}
	
	// API 資料（價格等），設定過期時間
	if (url.pathname.startsWith('/api/')) {
		// 實作帶過期時間的快取策略
	}
});
```

---

## 🎯 總結重點

### Service Worker 的核心價值

1. **提升效能**：常用資源直接從快取載入
2. **離線功能**：沒網路也能基本使用
3. **更好體驗**：減少載入等待時間

### SvelteKit 的優勢

1. **設定簡單**：建立檔案就自動啟用
2. **整合良好**：與建置系統完美配合
3. **彈性高**：想要多複雜都可以

### 使用建議

1. **從簡單開始**：先快取基本檔案
2. **逐步優化**：根據需求添加功能
3. **測試重要**：離線功能要確實測試
4. **注意快取**：避免過時資料的問題

Service Worker 是現代 Web 應用的重要功能，SvelteKit 讓它變得更容易使用。先從基本的快取開始，再根據需求逐步增強功能！
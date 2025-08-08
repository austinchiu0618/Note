# Shallow routing

## 🎯 什麼是淺層路由？

想像一下，你在看一本雜誌，看到一張有趣的照片想要放大來看。傳統的做法是：
1. 記住目前看到第幾頁
2. 翻到照片的詳細頁面
3. 看完後翻回原來的頁面

但這樣很麻煩！更好的做法是：
1. 直接把照片放大顯示在目前頁面上
2. 看完後輕輕一按就回到原本的狀態

**淺層路由**就是這種「在不真正換頁的情況下，創造換頁的感覺」的技術。

### 為什麼需要淺層路由？

**傳統網頁導航的問題：**
- 每次點擊都要載入新頁面，很慢
- 失去了目前頁面的狀態
- 使用者體驗不夠順暢

**淺層路由的好處：**
- 保持在同一個頁面，速度快
- 可以用「上一頁」按鈕關閉彈窗
- 特別適合行動裝置的手勢操作

---

## 🏛️ 瀏覽器歷史記錄的概念

### 什麼是歷史記錄？

每當你在網站上點擊連結，瀏覽器就會在「歷史記錄」中新增一筆紀錄。這就像是你在書上做書籤一樣：

```
歷史記錄：
[首頁] → [商品列表] → [商品詳情] → [購物車]
                                      ↑ 你現在在這裡
```

當你按「上一頁」時，瀏覽器就會跳回到購物車的前一個位置（商品詳情）。

### 傳統導航 vs 淺層路由

**傳統導航：**
- 每次點擊都創造新的歷史記錄
- 每個記錄都對應一個真實的頁面
- 按上一頁會載入完整的頁面

**淺層路由：**
- 創造歷史記錄，但不換頁面
- 記錄中儲存「狀態」資訊
- 按上一頁只是改變頁面狀態

---

## 🛠️ pushState 和 replaceState

### pushState：新增歷史記錄

`pushState` 就像在書籤清單中加入一個新的書籤：

```javascript
import { pushState } from '$app/navigation';

// 新增一個歷史記錄，並設定狀態
pushState('', { showModal: true });
```

**參數說明：**
- 第一個參數：新的 URL（空字串表示保持目前 URL）
- 第二個參數：要儲存的狀態資料

### replaceState：替換目前記錄

`replaceState` 就像是覆蓋目前的書籤：

```javascript
import { replaceState } from '$app/navigation';

// 替換目前的歷史記錄
replaceState('', { modalStep: 2 });
```

**使用時機：**
- 更新目前狀態，不想增加新的歷史記錄
- 修正錯誤的狀態
- 多步驟流程中的步驟切換

---

## 🔍 實際應用：歷史驅動的彈窗

### 基本彈窗範例

```svelte
<script>
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import Modal from '$lib/Modal.svelte';

	function openModal() {
		// 創造一個新的歷史記錄，狀態為「顯示彈窗」
		pushState('', { showModal: true });
	}

	function closeModal() {
		// 回到上一個歷史記錄（關閉彈窗）
		history.back();
	}
</script>

<h1>照片集</h1>

<button onclick={openModal}>
	查看大圖
</button>

<!-- 根據頁面狀態決定是否顯示彈窗 -->
{#if page.state.showModal}
	<Modal onclose={closeModal}>
		<img src="/large-photo.jpg" alt="大圖" />
	</Modal>
{/if}
```

### 這個範例的運作流程

1. **使用者點擊按鈕**：執行 `openModal()`
2. **pushState 執行**：瀏覽器歷史記錄增加一筆，狀態設為 `{ showModal: true }`
3. **頁面狀態更新**：`page.state.showModal` 變成 `true`
4. **彈窗顯示**：因為狀態為 true，所以顯示 Modal 組件
5. **使用者按返回鍵**：瀏覽器回到上一個歷史記錄
6. **彈窗關閉**：`page.state.showModal` 變成 `undefined`（或 `false`）

---

## 📱 為什麼這對行動裝置很重要？

### 手勢操作的自然性

在手機上，使用者習慣用手勢來操作：
- **向左滑動**：回到上一頁
- **向右滑動**：前往下一頁
- **點擊返回鍵**：關閉目前的內容

### 傳統彈窗的問題

```svelte
<!-- 傳統彈窗：沒有歷史記錄 -->
<script>
	let showModal = $state(false);
</script>

{#if showModal}
	<Modal onclose={() => showModal = false}>
		內容
	</Modal>
{/if}
```

**問題：**
- 使用者滑動返回時，不會關閉彈窗
- 可能會意外離開整個頁面
- 不符合使用者的操作直覺

### 淺層路由的解決方案

使用 `pushState`，彈窗就會「融入」瀏覽器的歷史記錄中，手勢操作就會自然地關閉彈窗。

---

## 🖼️ 進階應用：照片畫廊

### 預載入資料的概念

想像你在一個照片網站上瀏覽縮圖，點擊某張照片時，你希望：
1. 立即顯示大圖（不要等待載入）
2. 可以用返回鍵關閉
3. 如果載入失敗，就跳轉到實際頁面

### 完整的照片畫廊範例

```svelte
<script>
	import { preloadData, pushState, goto } from '$app/navigation';
	import { page } from '$app/state';
	import Modal from '$lib/Modal.svelte';
	import PhotoPage from './[id]/+page.svelte';

	// 從伺服器載入的縮圖資料
	let { data } = $props();

	async function openPhoto(event) {
		// 檢查是否應該使用傳統導航
		if (shouldUseTraditionalNavigation(event)) {
			return; // 讓瀏覽器處理正常的點擊
		}

		// 阻止預設的頁面跳轉
		event.preventDefault();

		const href = event.currentTarget.href;

		try {
			// 載入照片頁面的資料
			const result = await preloadData(href);

			if (result.type === 'loaded' && result.status === 200) {
				// 成功載入，使用淺層路由顯示
				pushState(href, { selectedPhoto: result.data });
			} else {
				// 載入失敗，使用傳統導航
				goto(href);
			}
		} catch (error) {
			// 發生錯誤，使用傳統導航
			goto(href);
		}
	}

	function shouldUseTraditionalNavigation(event) {
		return (
			window.innerWidth < 640 ||    // 螢幕太小
			event.shiftKey ||             // Shift + 點擊（新視窗）
			event.metaKey ||              // Cmd + 點擊（Mac 新分頁）
			event.ctrlKey ||              // Ctrl + 點擊（Windows 新分頁）
			event.button === 1            // 滑鼠中鍵點擊
		);
	}
</script>

<h1>照片集</h1>

<div class="photo-grid">
	{#each data.thumbnails as thumbnail}
		<a
			href="/photos/{thumbnail.id}"
			onclick={openPhoto}
			data-sveltekit-preload-data="hover"
		>
			<img src={thumbnail.src} alt={thumbnail.alt} />
		</a>
	{/each}
</div>

<!-- 淺層路由的照片檢視器 -->
{#if page.state.selectedPhoto}
	<Modal onclose={() => history.back()}>
		<!-- 直接使用照片頁面的組件，傳入預載的資料 -->
		<PhotoPage data={page.state.selectedPhoto} />
	</Modal>
{/if}
```

### 這個範例的巧妙之處

1. **智能判斷**：根據使用者的操作決定使用淺層路由或傳統導航
2. **效能優化**：使用 `data-sveltekit-preload-data="hover"` 預載入資料
3. **容錯處理**：如果淺層路由失敗，自動降級為傳統導航
4. **組件重用**：直接使用現有的 `PhotoPage` 組件

---

## ⚡ preloadData 函數詳解

### 什麼是 preloadData？

`preloadData` 是一個特殊函數，它可以手動觸發 SvelteKit 的資料載入流程，就像使用者真的點擊連結一樣。

### 運作原理

```javascript
import { preloadData } from '$app/navigation';

const result = await preloadData('/photos/123');

// 結果可能是：
// { type: 'loaded', status: 200, data: {...} }     // 成功
// { type: 'loaded', status: 404, data: {...} }     // 找不到頁面
// { type: 'redirect', location: '/other-page' }    // 重新導向
```

### 與預載入屬性的協作

```svelte
<!-- 使用 hover 預載入 -->
<a href="/photos/123" data-sveltekit-preload-data="hover">
	<img src="thumbnail.jpg" />
</a>
```

當使用者滑鼠移到縮圖上時，SvelteKit 已經開始載入資料。之後呼叫 `preloadData` 時，就會直接回傳已經載入好的結果，非常快速！

---

## 📱 Type Safety：讓程式碼更安全

### 定義頁面狀態的型別

```typescript
declare global {
	namespace App {
		interface PageState {
			showModal?: boolean;
			selectedPhoto?: {
				id: string;
				title: string;
				url: string;
			};
			modalStep?: number;
		}
	}
}

export {};
```

### 使用型別安全的狀態

```svelte
<script lang="ts">
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';

	function openModal() {
		// TypeScript 會檢查狀態物件是否符合 PageState 介面
		pushState('', {
			showModal: true,
			modalStep: 1
		});
	}
</script>

<!-- TypeScript 知道 page.state.showModal 的型別 -->
{#if page.state.showModal}
	<div>彈窗內容</div>
{/if}
```

---

## ⚠️ 重要注意事項

### 伺服器端渲染的限制

**問題：**
在伺服器端，`page.state` 永遠是空物件 `{}`。

**影響：**
- 使用者第一次造訪頁面時，不會有任何狀態
- 重新整理頁面時，狀態會消失
- 從其他網站連結過來時，狀態不會存在

**解決方案：**
```svelte
<script>
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	// 只在瀏覽器端檢查狀態
	$: showModal = browser && page.state.showModal;
</script>

{#if showModal}
	<Modal />
{/if}
```

### JavaScript 必要性

**淺層路由完全依賴 JavaScript**，所以：

**設計考量：**
- 提供無 JavaScript 的後備方案
- 確保基本功能在沒有 JavaScript 時也能運作
- 漸進式增強的設計原則

**範例：**
```svelte
<a href="/photos/{id}" onclick={enhancedClick}>
	<!-- 沒有 JS：正常跳轉到照片頁面 -->
	<!-- 有 JS：使用淺層路由顯示彈窗 -->
	<img src="thumbnail.jpg" />
</a>
```

---

## 🎯 最佳實踐建議

### 1. 適合使用淺層路由的場景

**✅ 很適合：**
- 照片/影片檢視器
- 確認對話框
- 詳細資訊彈窗
- 設定面板
- 篩選器面板

**❌ 不適合：**
- 複雜的表單流程
- 需要完整頁面的內容
- 需要SEO的重要頁面

### 2. 效能考量

```svelte
<!-- 好的做法：結合預載入 -->
<a 
	href="/detail/{id}" 
	data-sveltekit-preload-data="hover"
	onclick={handleClick}
>
	項目 {id}
</a>

<!-- 避免：每次點擊都重新載入 -->
<button onclick={() => loadAndShow(id)}>
	項目 {id}
</button>
```

### 3. 使用者體驗

```svelte
<script>
	import { page } from '$app/state';
	
	// 提供視覺回饋
	$: isModalOpen = page.state.showModal;
	
	// 處理返回按鍵的提示
	function showHint() {
		if (isModalOpen) {
			// 顯示「按返回鍵關閉」的提示
		}
	}
</script>
```

---

## 🎯 總結重點

### 淺層路由的核心價值

1. **保持脈絡**：不離開目前頁面，保持使用者的操作脈絡
2. **效能提升**：避免完整頁面重載，提供更快的反應
3. **手勢友善**：支援行動裝置的自然手勢操作
4. **向後相容**：提供漸進式增強，沒有 JavaScript 也能運作

### 關鍵技術概念

- **pushState**：創造新的歷史記錄和狀態
- **replaceState**：更新目前的歷史記錄
- **page.state**：存取目前頁面的狀態
- **preloadData**：手動觸發資料預載入

### 使用建議

1. **謹慎使用**：不是所有互動都適合淺層路由
2. **提供後備**：確保沒有 JavaScript 時的基本功能
3. **效能優化**：結合預載入機制提升使用者體驗
4. **型別安全**：使用 TypeScript 定義狀態介面

淺層路由是 SvelteKit 提供的強大功能，它讓你可以創造更流暢、更自然的使用者互動體驗。重點是要在適當的場景使用，並且始終考慮沒有 JavaScript 的使用者！
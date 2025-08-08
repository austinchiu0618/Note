# Svelte 5 完整學習指南 📚

> 全面學習 Svelte 5，掌握最新的 Runes 響應式原語和現代化開發模式

## 🎯 學習路線圖

這份指南以 Svelte 5 為主，介紹最新的語法和最佳實踐，適合初學者到中級開發者。

---

## 📋 目錄

### 第一部分：基礎入門
1. [專案建立與環境設置](#1-專案建立與環境設置)
2. [Svelte 5 基本語法](#2-svelte-5-基本語法)
3. [Runes 響應式原語](#3-runes-響應式原語)
4. [模板語法](#4-模板語法)
5. [資料綁定](#5-資料綁定)

### 第二部分：進階功能
6. [Snippet 與渲染](#6-snippet-與渲染)
7. [調試與開發工具](#7-調試與開發工具)
8. [Actions 使用](#8-actions-使用)
9. [動畫與過渡](#9-動畫與過渡)
10. [樣式與 CSS](#10-樣式與-css)

### 第三部分：狀態管理
11. [狀態管理進階](#11-狀態管理進階)
12. [Context 上下文](#12-context-上下文)
13. [特殊元素](#13-特殊元素)

### 第四部分：組件系統
14. [生命週期與副作用](#14-生命週期與副作用)
15. [組件 API 與通訊](#15-組件-api-與通訊)

### 第五部分：進階開發
16. [TypeScript 支援](#16-typescript-支援)
17. [自定義元素](#17-自定義元素)
18. [測試](#18-測試)
19. [性能優化](#19-效能優化)
20. [遷移與最佳實踐](#20-遷移指南)

---

## 1. 專案建立與環境設置

### 快速開始

#### 方法一：SvelteKit（推薦）
```bash
# 建立 SvelteKit 專案
npx sv create svelte-app

# 選擇模板
# ✓ Which template would you like?
#   › Skeleton project
# ✓ Add type checking with TypeScript?
#   › Yes, using TypeScript syntax

# 進入專案並安裝
cd svelte-app
npm install

# 啟動開發伺服器
npm run dev
```

#### 方法二：Vite + Svelte（適合 SPA）
```bash
# 建立新專案
npm create vite@latest svelte-app -- --template svelte-ts

# 進入專案目錄
cd svelte-app

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 專案結構
```
svelte-app/
├── src/
│   ├── lib/           # 共用組件和工具
│   ├── routes/        # 路由頁面（SvelteKit）
│   ├── app.html       # HTML 模板
│   └── App.svelte     # 主要組件
├── static/            # 靜態資源
└── package.json
```

---

## 2. Svelte 5 基本語法

### .svelte 檔案結構

每個 `.svelte` 檔案都包含三個主要部分：

```svelte
<script>
	// Svelte 5 使用 Runes 進行狀態管理
	let count = $state(0);
	
	function increment() {
		count += 1;
	}
</script>

<!-- HTML 模板 -->
<div>
	<button onclick={increment}>
		點擊次數: {count}
	</button>
</div>

<style>
	/* CSS 樣式（自動作用域化） */
	button {
		background: #007acc;
		color: white;
		padding: 10px 20px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
```

### 基本概念

- **Runes**：Svelte 5 的新響應式原語系統
- **$state()**：管理組件狀態
- **$derived()**：建立衍生值
- **$effect()**：處理副作用
- **作用域化 CSS**：樣式隻影響當前組件
- **組件化**：可重複使用的 UI 元件

---

## 3. Runes 響應式原語

> **Runes 是 Svelte 5 的核心特色**，提供更強大和靈活的響應式系統

### `$state` 狀態管理
```svelte
<script>
	// 基本狀態
	let count = $state(0);
	let name = $state('世界');
	
	// 物件狀態
	let user = $state({
		id: 1,
		name: 'John',
		email: 'john@example.com'
	});
	
	// 陣列狀態
	let todos = $state([
		{ id: 1, text: '學習 Svelte 5', completed: false },
		{ id: 2, text: '掌握 Runes', completed: false }
	]);
	
	function addTodo() {
		todos.push({
			id: Date.now(),
			text: '新任務',
			completed: false
		});
	}
</script>

<h1>你好, {name}!</h1>
<p>計數: {count}</p>
<button onclick={() => count++}>增加</button>

<input bind:value={user.name} placeholder="姓名" />
<p>用户: {user.name}</p>

{#each todos as todo (todo.id)}
	<div>
		<input type="checkbox" bind:checked={todo.completed} />
		{todo.text}
	</div>
{/each}
<button onclick={addTodo}>新增任務</button>
```

### `$derived` 衍生值
```svelte
<script>
	let count = $state(0);
	let multiplier = $state(2);
	
	// 簡單衍生值
	let doubled = $derived(count * 2);
	let multiplied = $derived(count * multiplier);
	
	// 複雜衍生值
	let statistics = $derived.by(() => {
		const isEven = count % 2 === 0;
		const square = count ** 2;
		
		return {
			isEven,
			square,
			description: isEven ? '偶數' : '奇數'
		};
	});
</script>

<input type="number" bind:value={count} />
<input type="number" bind:value={multiplier} />

<p>原值: {count}</p>
<p>雙倍: {doubled}</p>
<p>乘積: {multiplied}</p>
<p>平方: {statistics.square}</p>
<p>描述: {statistics.description}</p>
```

### `$effect` 副作用處理
```svelte
<script>
	let count = $state(0);
	
	// 基本副作用
	$effect(() => {
		console.log('Count 變更為:', count);
		document.title = `計數: ${count}`;
	});
	
	// 清理副作用
	$effect(() => {
		const interval = setInterval(() => {
			console.log('定時檢查，當前計數:', count);
		}, 5000);
		
		// 返回清理函數
		return () => {
			clearInterval(interval);
		};
	});
</script>

<p>計數: {count}</p>
<button onclick={() => count++}>增加計數</button>
```

### `$props` 組件屬性
```svelte
<!-- 父組件 -->
<script>
	import UserCard from './UserCard.svelte';
	
	let user = $state({
		id: 1, 
		name: 'Alice', 
		age: 25
	});
</script>

<UserCard {user} />

<!-- UserCard.svelte 子組件 -->
<script>
	// 使用 $props() 接收屬性
	let { user } = $props();
</script>

<div>
	<h3>{user.name}</h3>
	<p>年齡: {user.age}</p>
</div>
```

### `$bindable` 雙向綁定
```svelte
<!-- 父組件 -->
<script>
	import NumberInput from './NumberInput.svelte';
	
	let quantity = $state(1);
</script>

<NumberInput bind:value={quantity} />
<p>數量: {quantity}</p>
```
```svelte
<!-- NumberInput.svelte -->
<script>
	let { value = $bindable(0) } = $props();
</script>

<input type="number" bind:value />
```

---

## 4. 模板語法

### 條件渲染
```svelte
<script>
	let user = $state({ name: 'John', age: 25 });
	let temperature = $state(75);
</script>

<!-- 簡單條件 -->
{#if user}
	<p>歡迎, {user.name}!</p>
{/if}

<!-- 多重條件 -->
{#if temperature > 100}
	<p>太熱了！🔥</p>
{:else if temperature < 50}
	<p>太冷了！🧊</p>
{:else}
	<p>温度剛好 😊</p>
{/if}
```

### 列表渲染
```svelte
<script>
	let items = $state([
		{ id: 1, name: '蘋果', qty: 3 },
		{ id: 2, name: '香蕉', qty: 5 },
		{ id: 3, name: '橘子', qty: 2 }
	]);
	
	function addItem() {
		items.push({
			id: Date.now(),
			name: '新水果',
			qty: 1
		});
	}
</script>

<!-- 基本列表 -->
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>

<!-- 帶索引的列表 -->
<ul>
	{#each items as item, index}
		<li>{index + 1}. {item.name} x {item.qty}</li>
	{/each}
</ul>

<!-- 帶 key 的列表（推薦用於動態列表） -->
<ul>
	{#each items as item (item.id)}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>

<!-- 空狀態處理 -->
{#each items as item}
	<p>{item.name}</p>
{:else}
	<p>沒有項目</p>
{/each}

<button onclick={addItem}>新增項目</button>
```

### Key 區塊
```svelte
<script>
	let value = $state(0);
</script>

<!-- 當 value 改變時，重新創建區塊 -->
{#key value}
	<div>這個區塊會在 value 改變時重建: {value}</div>
{/key}

<button onclick={() => value++}>改變值</button>
```

### 非同步處理
```svelte
<script>
	let userId = $state(1);
	
	async function fetchUserData(id) {
		const response = await fetch(`/api/user/${id}`);
		return response.json();
	}
	
	// 根據 userId 重新獲取資料
	let userPromise = $derived(fetchUserData(userId));
</script>

{#await userPromise}
	<p>載入中...</p>
{:then user}
	<p>Hello {user.name}!</p>
{:catch error}
	<p>發生錯誤: {error.message}</p>
{/await}

<!-- 簡化版本（只處理成功狀態） -->
{#await userPromise then user}
	<p>用户信息: {user.name}</p>
{/await}

<button onclick={() => userId++}>切換用户</button>
```

---

## 5. 資料綁定

### 基本綁定
```svelte
<script>
	let name = $state('');
	let isChecked = $state(false);
	let selectedValue = $state('');
</script>

<!-- 文字輸入 -->
<input bind:value={name} placeholder="輸入名字" />
<p>你好, {name}!</p>

<!-- 核取方塊 -->
<input type="checkbox" bind:checked={isChecked} />
<p>已選取: {isChecked}</p>

<!-- 單選按鈕 -->
<input type="radio" bind:group={selectedValue} value="option1" />
<input type="radio" bind:group={selectedValue} value="option2" />
<p>選擇: {selectedValue}</p>
```

### 進階綁定
```svelte
<script>
	let files = $state();
	let selectedOptions = $state([]);
	let element = $state();
</script>

<!-- 檔案上傳 -->
<input type="file" bind:files />
{#if files}
	<p>選擇了 {files.length} 個檔案</p>
{/if}

<!-- 下拉選單 -->
<select bind:value={selectedValue}>
	<option value="a">A</option>
	<option value="b">B</option>
	<option value="c">C</option>
</select>

<!-- 多選下拉 -->
<select multiple bind:value={selectedOptions}>
	<option value="1">選項 1</option>
	<option value="2">選項 2</option>
	<option value="3">選項 3</option>
</select>

<!-- 元素引用 -->
<div bind:this={element}>
	<p>可以通過 element 變數存取這個 DOM 元素</p>
</div>
```

### 尺寸綁定
```svelte
<script>
	let width = $state(0);
	let height = $state(0);
</script>

<div 
	bind:clientWidth={width}
	bind:clientHeight={height}
>
	大小: {width} x {height}
</div>
```

### 組件綁定
```svelte
<!-- 父組件 -->
<script>
	import Child from './Child.svelte';
	let childValue = $state('');
</script>

<Child bind:value={childValue} />
<p>子組件的值: {childValue}</p>
```
```svelte
<!-- 子組件 (Child.svelte) -->
<script>
	let { value = $bindable('') } = $props();
</script>

<input bind:value />
```

---

## 6. Snippet 與渲染

### Snippet 基礎
```svelte
<script>
	let items = $state(['項目1', '項目2', '項目3']);
</script>

{#snippet listItem(item, index)}
	<li>
		{index + 1}. {item}
	</li>
{/snippet}

<ul>
	{#each items as item, i}
		{@render listItem(item, i)}
	{/each}
</ul>
```

### 條件 Snippet
```svelte
<script>
	let showGreeting = $state(true);
	let userName = $state('John');
</script>

{#snippet greeting(name)}
	<h1>你好, {name}!</h1>
{/snippet}

{#snippet farewell(name)}
	<h1>再見, {name}!</h1>
{/snippet}

{@render showGreeting ? greeting(userName) : farewell(userName)}

<button onclick={() => showGreeting = !showGreeting}>
	切換問候
</button>
```

### 動態 Snippet
```svelte
<script>
	let products = $state([
		{ id: 1, name: '筆記型電腦', price: 30000 },
		{ id: 2, name: '滑鼠', price: 800 }
	]);
</script>

{#snippet productCard(product)}
	<div>
		<h3>{product.name}</h3>
		<p>價格: NT$ {product.price}</p>
	</div>
{/snippet}

{#snippet productList(product, index)}
	<li>{index + 1}. {product.name} - NT$ {product.price}</li>
{/snippet}

<!-- 卡片視圖 -->
{#each products as product}
	{@render productCard(product)}
{/each}

<!-- 列表視圖 -->
<ul>
	{#each products as product, index}
		{@render productList(product, index)}
	{/each}
</ul>
```

---

## 7. 調試與開發工具

### HTML 渲染與調試
```svelte
<script>
	let user = $state({
		name: 'John',
		bio: '<p>前端開發者，熱愛 <strong>Svelte 5</strong></p>'
	});
	let items = $state([1, 2, 3]);
	let count = $state(5);
</script>

<!-- 輸出 HTML 內容 -->
{@html user.bio}

<!-- 常數值計算 -->
{#each items as item}
	{@const doubled = item * 2}
	{@const isEven = item % 2 === 0}
	<p>項目 {item}: 雙倍為 {doubled} ({isEven ? '偶數' : '奇數'})</p>
{/each}

<!-- 調試輸出 -->
{@debug user, items, count}
```

### Svelte 5 調試功能
```svelte
<script>
	let data = $state({ users: [], loading: true });
	
	// 使用 $inspect 進行調試
	$inspect(data);
	
	// 條件調試
	$inspect(data.users).with((type, users) => {
		if (type === 'update' && users.length > 0) {
			console.log('用户資料已載入:', users);
		}
	});
	
	// 效果中的調試
	$effect(() => {
		if (data.users.length > 5) {
			console.warn('用户數量過多');
		}
	});
</script>

<p>載入狀態: {data.loading ? '載入中' : '完成'}</p>
<p>用户數量: {data.users.length}</p>
```

---

## 8. Actions 使用
`Actions 是在元素掛載時調用的函數。它們通過 `use:` 指令添加，通常會使用 `$effect` 以便在元素卸載時重置任何狀態：

### 基本 Action
```svelte
<script>
  /** @type {import('svelte/action').Action} */
  function myAction(node) {
    // 節點已被掛載到 DOM 中

		// Svelte 5
    $effect(() => {
      // 這裏進行設置

      return () => {
        // 這裏進行清理
      };
    });

		// Svelte 4
		return {
			update(){

			},
			destroy() {
				// 這裏進行清理
			}
		};
  }
</script>

<div use:myAction>...</div>
```

### 帶參數的 Action
```svelte
<script>
  /** @type {import('svelte/action').Action} */
  function myaction(node, data) {
    // ...
  }
</script>

<div use:myaction={data}>...</div>
```

action 只會調用一次（但在服務端渲染期間不會調用）—— 即使參數發生變化也不會再次運行。

---

## 9. 動畫與過渡

### 基本過渡
```svelte
<script>
	import { fade, fly, scale } from 'svelte/transition';
	let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>
	切換顯示
</button>

{#if visible}
	<p transition:fade>淡入淡出</p>
	<p transition:fly={{ y: 200, duration: 2000 }}>飛入效果</p>
	<p transition:scale={{ start: 0.5 }}>縮放效果</p>
{/if}
```

### 進入與離開動畫
```svelte
<script>
	import { fade, fly } from 'svelte/transition';
	let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>
	切換顯示
</button>

{#if visible}
	<p 
		in:fly={{ x: -200 }} 
		out:fade
	>
		不同的進入和離開動畫
	</p>
{/if}
```

### 動畫指令
```svelte
<script>
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	
	let items = $state([
		{ id: 1, name: '項目 1' },
		{ id: 2, name: '項目 2' },
		{ id: 3, name: '項目 3' }
	]);
	
	function shuffle() {
		items = items.sort(() => Math.random() - 0.5);
	}
	
	function addItem() {
		items.push({
			id: Date.now(),
			name: `項目 ${items.length + 1}`
		});
	}
	
	function removeItem(id) {
		items = items.filter(item => item.id !== id);
	}
</script>

<button onclick={shuffle}>打亂順序</button>
<button onclick={addItem}>新增項目</button>

{#each items as item (item.id)}
	<div 
		animate:flip={{ duration: 300 }}
		transition:fade
	>
		{item.name}
		<button onclick={() => removeItem(item.id)}>移除</button>
	</div>
{/each}
```

---

## 10. 樣式與 CSS

### 基本樣式
```svelte
<script>
	let isDark = $state(false);
	let fontSize = $state(16);
	let isActive = $state(false);
</script>

<!-- Class 綁定 -->
<div class="container" class:dark={isDark}>
	內容
</div>

<!-- 內聯樣式 -->
<p style="font-size: {fontSize}px; color: red;">
	動態樣式
</p>

<p style:font-size={myColor} style:color={color}>...</p>

<!-- 條件 class -->
<button 
	class:active={isActive} 
	class:disabled={!isActive}
	onclick={() => isActive = !isActive}
>
	切換狀態
</button>

<button onclick={() => isDark = !isDark}>
	切換主題
</button>

<!-- 內部樣式 :global -->
<MyComponent />

<style>
.component :global(p) {
  /* 應用於屬於本組件的 <div> 元素內的所有 <strong> 元素，無論這些 <strong>屬於個組件 */
  color: white;
}
</style>
```

---

## 11. 狀態管理進階

### 使用 Runes 進行狀態管理
```svelte
<script>
	// 應用層級狀態
	let appState = $state({
		user: null,
		theme: 'light',
		notifications: []
	});
	
	// 衍生狀態
	let isLoggedIn = $derived(appState.user !== null);
	let unreadCount = $derived(
		appState.notifications.filter(n => !n.read).length
	);
	
	// 狀態操作
	function login(userData) {
		appState.user = userData;
	}
	
	function addNotification(message) {
		appState.notifications.push({
			id: Date.now(),
			message,
			read: false
		});
	}
	
	function toggleTheme() {
		appState.theme = appState.theme === 'light' ? 'dark' : 'light';
	}
</script>

<div class="app" class:dark={appState.theme === 'dark'}>
	{#if isLoggedIn}
		<p>歡迎, {appState.user.name}!</p>
		<p>未讀通知: {unreadCount}</p>
	{:else}
		<button onclick={() => login({ name: '用户' })}>登入</button>
	{/if}
	
	<button onclick={toggleTheme}>切換主題</button>
	<button onclick={() => addNotification('新通知')}>
		新增通知
	</button>
</div>
```

### 傳統 Stores（仍可使用）
```javascript
// stores.js
import { writable, derived } from 'svelte/store';

export const count = writable(0);
export const user = writable(null);

export const userName = derived(
	user,
	$user => $user ? $user.name : 'Guest'
);

// 自定義 store
function createCounter() {
	const { subscribe, set, update } = writable(0);
	
	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		reset: () => set(0)
	};
}

export const counter = createCounter();
```

```svelte
<!-- 使用 stores -->
<script>
	import { count, counter } from './stores.js';
</script>

<p>計數: {$count}</p>
<p>自定義計數器: {$counter}</p>

<button onclick={() => count.update(n => n + 1)}>+1</button>
<button onclick={counter.increment}>自定義 +1</button>
<button onclick={counter.reset}>重置</button>
```

---

## 12. Context 上下文

Context 是 Svelte 提供的一種機制，讓你可以在組件樹中向下傳遞數據，而不需要通過 props 一層層傳遞（解決 prop drilling 問題）。

### 設置與使用 Context
```svelte
<!-- App.svelte -->
<script>
	import { setContext } from 'svelte';
	import Child from './Child.svelte';
	
	// 使用 $state 創建響應式 context
	let theme = $state({
		primaryColor: '#007acc',
		fontSize: '16px',
		isDark: false
	});
	
	setContext('theme', theme);
	
	function toggleTheme() {
		theme.isDark = !theme.isDark;
		theme.primaryColor = theme.isDark ? '#bb86fc' : '#007acc';
	}
</script>

<button onclick={toggleTheme}>切換主題</button>
<Child />
```

```svelte
<!-- Child.svelte -->
<script>
	import { getContext } from 'svelte';
	
	const theme = getContext('theme');
</script>

<div style="color: {theme.primaryColor}; font-size: {theme.fontSize};">
	使用主題顏色的文字
	{#if theme.isDark}
		<p>當前是深色主題</p>
	{:else}
		<p>當前是淺色主題</p>
	{/if}
</div>
```

### 多層 Context
```svelte
<!-- 根組件 -->
<script>
	import { setContext } from 'svelte';
	let appConfig = $state({
		apiUrl: 'https://api.example.com',
		version: '1.0.0'
	});
	
	setContext('app', appConfig);
</script>

<!-- 中間組件 -->
<script>
	import { getContext, setContext } from 'svelte';
	
	const app = getContext('app');
	let userPrefs = $state({
		language: 'zh-TW',
		timezone: 'Asia/Taipei'
	});
	
	setContext('user', userPrefs);
</script>

<!-- 深層子組件 -->
<script>
	import { getContext } from 'svelte';
	
	const app = getContext('app');
	const user = getContext('user');
</script>

<p>API: {app.apiUrl}</p>
<p>語言: {user.language}</p>
```

---

## 13. 特殊元素

### `<svelte:window>`
```svelte
<script>
	let scrollY = $state(0);
	let innerWidth = $state(0);
	
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			alert('按下了 ESC 鍵');
		}
	}
</script>

<svelte:window 
	bind:scrollY 
	bind:innerWidth 
	on:keydown={handleKeydown} 
/>

<p>捲動位置: {scrollY}</p>
<p>視窗寬度: {innerWidth}</p>
```

### `<svelte:document>` 和 `<svelte:body>`
```svelte
<script>
	let clickCount = $state(0);
	let mousePosition = $state({ x: 0, y: 0 });
	
	function handleClick() {
		clickCount++;
	}
	
	function handleMousemove(event) {
		mousePosition = {
			x: event.clientX,
			y: event.clientY
		};
	}
</script>

<svelte:document onclick={handleClick} />
<svelte:body on:mousemove={handleMousemove} />

<p>文檔點擊次數: {clickCount}</p>
<p>滑鼠位置: ({mousePosition.x}, {mousePosition.y})</p>
```

---

## 14. 生命週期與副作用

### Svelte 5 中的副作用管理
```svelte
<script>
	import { tick } from 'svelte';
	
	let data = $state([]);
	let mounted = $state(false);
	
	// 掛載副作用（等同於 onMount）
	$effect(() => {
		mounted = true;
		console.log('組件已掛載');
		
		// 模擬資料載入
		fetchData();
		
		// 清理函數（等同於 onDestroy）
		return () => {
			console.log('組件即將卸載');
		};
	});
	
	// 監聽特定狀態變化
	$effect(() => {
		if (data.length > 0) {
			console.log('資料已載入:', data.length, '項目');
		}
	});
	
	async function fetchData() {
		// 模擬 API 調用
		await new Promise(resolve => setTimeout(resolve, 1000));
		data = [
			{ id: 1, name: '項目 1' },
			{ id: 2, name: '項目 2' }
		];
	}
	
	async function addItem() {
		data = [...data, {
			id: Date.now(),
			name: `項目 ${data.length + 1}`
		}];
		
		// 等待 DOM 更新
		await tick();
		
		const newElement = document.querySelector('.item:last-child');
		newElement?.scrollIntoView();
	}
</script>

<div>
	<p>組件狀態: {mounted ? '已掛載' : '掛載中'}</p>
	<p>項目數量: {data.length}</p>
	
	{#each data as item}
		<div class="item">{item.name}</div>
	{/each}
	
	<button onclick={addItem}>新增項目</button>
</div>
```

### 條件性副作用
```svelte
<script>
	let count = $state(0);
	let isActive = $state(true);
	let timer = $state(null);
	
	// 只有在 isActive 為 true 時才運行計時器
	$effect(() => {
		if (isActive) {
			timer = setInterval(() => {
				count++;
			}, 1000);
			
			return () => {
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
			};
		}
	});
	
	// 監聽計數變化
	$effect(() => {
		if (count > 10) {
			console.warn('計數已超過 10');
		}
	});
</script>

<p>計數: {count}</p>
<p>狀態: {isActive ? '運行中' : '已停止'}</p>

<button onclick={() => isActive = !isActive}>
	{isActive ? '停止' : '開始'}
</button>
<button onclick={() => count = 0}>重置</button>
```

### Pre-effect（DOM 更新前）
```svelte
<script>
	let items = $state(['A', 'B', 'C']);
	let scrollPosition = $state(0);
	
	// 在 DOM 更新前執行
	$effect.pre(() => {
		console.log('DOM 更新前，項目數量:', items.length);
		// 記錄當前滾動位置
		scrollPosition = document.documentElement.scrollTop;
	});
	
	// 在 DOM 更新後執行
	$effect(() => {
		console.log('DOM 更新後，項目數量:', items.length);
		// 恢復滾動位置（如果需要）
		if (scrollPosition > 0) {
			document.documentElement.scrollTop = scrollPosition;
		}
	});
	
	function addItem() {
		items = [...items, String.fromCharCode(65 + items.length)];
	}
	
	function removeItem() {
		if (items.length > 0) {
			items = items.slice(0, -1);
		}
	}
</script>

{#each items as item}
	<div>{item}</div>
{/each}

<button onclick={addItem}>新增</button>
<button onclick={removeItem}>移除</button>
```

---

## 15. 組件 API 與通訊

### 事件處理與派發
```svelte
<!-- App.svelte -->
<script>
	import Button from './Button.svelte';
	
	function handleClick() {
		console.log('按鈕被點擊');
	}
	
	function handleCustomClick(event) {
		console.log('自定義事件:', event.detail);
	}
</script>

<Button 
	onclick={handleClick}
	on:customClick={handleCustomClick}
>
	點我
</Button>
```

```svelte
<!-- Button.svelte -->
<script>
	let { onclick, children } = $props();
	
	// 自定義事件派發
	function handleClick(event) {
		// Svelte 5
		onclick?.(event);
		
		// Svelte 4
		// 派發自定義事件到父組件
		event.target.dispatchEvent(new CustomEvent('customClick', {
			detail: { message: '自定義事件', timestamp: Date.now() }
		}));
	}
</script>

<button onclick={handleClick}>
	{@render children?.()}
</button>
```

### Slot 插槽
```svelte
<!-- Card.svelte -->
<script>
  let { header, children, footer } = $props();
</script>

<div class="card">
	<header>		
		<slot name="header" />
		{@render header?.()}
	</header>
	
	<main>
		<slot />
		{@render children?.()}
	</main>
	
	<footer>
		<slot name="footer" />
		{@render footer?.() || '預設頁腳'}
	</footer>
</div>

<!-- 使用組件 -->
<script>
	import Card from './Card.svelte';
</script>

<Card title="自定義卡片">
	{#snippet header()}
		<p>額外的標題內容</p>
	{/snippet}
	
	<p>主要內容區域</p>
	
	{#snippet footer(data)}
		<p>自定義頁腳 - {data.timestamp.toLocaleString()}</p>
	{/snippet}
</Card>
```

### 組件間雙向通訊
```svelte
<!-- 父組件 -->
<script>
	import Counter from './Counter.svelte';
	
	let count = $state(0);
	let step = $state(1);
	
	function reset() {
		count = 0;
	}
</script>

<div>
	<h2>父組件控制</h2>
	<p>當前計數: {count}</p>
	<input type="number" bind:value={step} />
	<button onclick={reset}>重置</button>
</div>

<Counter bind:value={count} {step} />
```
```svelte
<!-- Counter.svelte -->
<script>
	let { value = $bindable(0), step = 1 } = $props();
	
	function increment() {
		value += step;
	}
	
	function decrement() {
		value -= step;
	}
</script>

<div>
	<h3>子組件</h3>
	<p>計數: {value}</p>
	<button onclick={decrement}>-{step}</button>
	<button onclick={increment}>+{step}</button>
</div>
```

### 複雜組件通訊
```svelte
<!-- 父組件 -->
<script>
	import UserList from './UserList.svelte';
	import UserDetail from './UserDetail.svelte';
	
	let users = $state([
		{ id: 1, name: 'Alice', email: 'alice@example.com' },
		{ id: 2, name: 'Bob', email: 'bob@example.com' }
	]);
	
	let selectedUser = $state(null);
	
	function handleUserSelect(user) {
		selectedUser = user;
	}
	
	function handleUserUpdate(updatedUser) {
		const index = users.findIndex(u => u.id === updatedUser.id);
		if (index !== -1) {
			users[index] = updatedUser;
		}
	}
	
	function handleUserDelete(userId) {
		users = users.filter(u => u.id !== userId);
		if (selectedUser?.id === userId) {
			selectedUser = null;
		}
	}
</script>

<div class="app-layout">
	<UserList 
		{users} 
		{selectedUser}
		onSelect={handleUserSelect}
		onDelete={handleUserDelete}
	/>
	
	{#if selectedUser}
		<UserDetail 
			user={selectedUser}
			onUpdate={handleUserUpdate}
		/>
	{/if}
</div>

<!-- UserList.svelte -->
<script>
	let { users, selectedUser, onSelect, onDelete } = $props();
</script>

<div class="user-list">
	<h3>用户列表</h3>
	{#each users as user}
		<div 
			class="user-item"
			class:selected={selectedUser?.id === user.id}
			onclick={() => onSelect(user)}
		>
			<span>{user.name}</span>
			<button onclick|stopPropagation={() => onDelete(user.id)}>
				刪除
			</button>
		</div>
	{/each}
</div>

<!-- UserDetail.svelte -->
<script>
	let { user, onUpdate } = $props();
	let editedUser = $state({ ...user });
	
	$effect(() => {
		editedUser = { ...user };
	});
	
	function save() {
		onUpdate(editedUser);
	}
</script>

<div class="user-detail">
	<h3>用户詳情</h3>
	<input bind:value={editedUser.name} placeholder="姓名" />
	<input bind:value={editedUser.email} placeholder="信箱" />
	<button onclick={save}>保存</button>
</div>
```

---

## 16. TypeScript 支援

### 基本 TypeScript 設置
```svelte
<script lang="ts">
	interface User {
		id: number;
		name: string;
		email: string;
	}
	
	let users = $state<User[]>([]);
	let selectedUser = $state<User | null>(null);
	
	async function fetchUsers(): Promise<User[]> {
		const response = await fetch('/api/users');
		return response.json();
	}
	
	function selectUser(user: User): void {
		selectedUser = user;
	}
	
	// 載入資料
	$effect(async () => {
		users = await fetchUsers();
	});
</script>

{#each users as user}
	<button onclick={() => selectUser(user)}>
		{user.name}
	</button>
{/each}

{#if selectedUser}
	<p>選擇的用户: {selectedUser.name}</p>
{/if}
```

### 組件 Props 類型
```svelte
<!-- Component.svelte -->
<script lang="ts">
	interface Props {
		title: string;
		count?: number;
		onClick?: (value: number) => void;
		users?: User[];
	}
	
	let { title, count = 0, onClick, users = [] }: Props = $props();
	
	function handleClick() {
		onClick?.(count + 1);
	}
</script>

<h2>{title}</h2>
<button onclick={handleClick}>
	計數: {count}
</button>

{#each users as user}
	<div>{user.name}</div>
{/each}
```

### 複雜型別定義
```svelte
<script lang="ts">
	type Theme = 'light' | 'dark';
	
	interface AppState {
		theme: Theme;
		user: User | null;
		preferences: {
			language: string;
			notifications: boolean;
		};
	}
	
	let appState = $state<AppState>({
		theme: 'light',
		user: null,
		preferences: {
			language: 'zh-TW',
			notifications: true
		}
	});
	
	// 泛型函數
	function updateState<K extends keyof AppState>(
		key: K, 
		value: AppState[K]
	): void {
		appState[key] = value;
	}
	
	// 事件處理函數型別
	const handleThemeChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		updateState('theme', target.value as Theme);
	};
</script>

<select onchange={handleThemeChange}>
	<option value="light">淺色</option>
	<option value="dark">深色</option>
</select>

<p>當前主題: {appState.theme}</p>
```

---

## 17. 自定義元素

### 建立 Web Component
```svelte
<svelte:options customElement="my-counter" />

<script>
	let count = $state(0);
	let step = $state(1);
	
	function increment() {
		count += step;
		
		// 派發自定義事件
		dispatchEvent(new CustomEvent('countChanged', { 
			detail: { count, step } 
		}));
	}
	
	function decrement() {
		count -= step;
		dispatchEvent(new CustomEvent('countChanged', { 
			detail: { count, step } 
		}));
	}
	
	// 監聽屬性變化
	$effect(() => {
		if (typeof customElements !== 'undefined') {
			const element = document.querySelector('my-counter');
			if (element) {
				element.setAttribute('count', count.toString());
			}
		}
	});
</script>

<div class="counter">
	<button onclick={decrement}>-</button>
	<span>{count}</span>
	<button onclick={increment}>+</button>
	<input type="number" bind:value={step} min="1" />
</div>
```

### 使用自定義元素
```html
<!-- HTML 中使用 -->
<script type="module" src="./my-counter.js"></script>

<my-counter></my-counter>

<script>
	// 監聽自定義事件
	document.querySelector('my-counter').addEventListener('countChanged', (e) => {
		console.log('計數變更:', e.detail);
	});
	
	// 程式控制
	const counter = document.querySelector('my-counter');
	counter.setAttribute('step', '5');
</script>
```

### 複雜 Web Component
```svelte
<svelte:options customElement="user-card" />

<script>
	// 接收外部屬性
	let { name = '未知用户', avatar = '', email = '' } = $props();
	
	let expanded = $state(false);
	
	function toggle() {
		expanded = !expanded;
		
		dispatchEvent(new CustomEvent('toggle', {
			detail: { expanded, name }
		}));
	}
	
	function sendEmail() {
		if (email) {
			window.location.href = `mailto:${email}`;
		}
	}
</script>

<div class="user-card" class:expanded>
	<div class="header">
		{#if avatar}
			<img src={avatar} alt={name} />
		{/if}
		<h3>{name}</h3>
		<button onclick={toggle}>
			{expanded ? '收起' : '展開'}
		</button>
	</div>
	
	{#if expanded}
		<div class="content">
			<p>信箱: {email}</p>
			<button onclick={sendEmail} disabled={!email}>
				發送郵件
			</button>
		</div>
	{/if}
</div>
```

### 屬性與事件處理
```javascript
// 使用 JavaScript 控制 Web Component
const userCard = document.createElement('user-card');
userCard.setAttribute('name', 'John Doe');
userCard.setAttribute('email', 'john@example.com');
userCard.setAttribute('avatar', 'avatar.jpg');

// 監聽事件
userCard.addEventListener('toggle', (event) => {
	console.log('卡片切換:', event.detail);
});

document.body.appendChild(userCard);
```

---

## 18. 測試

### 基本測試設置
```javascript
// tests/component.test.js
import { render, fireEvent } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Counter from '../src/Counter.svelte';

test('計數器遞增功能', async () => {
	const { getByText, getByRole } = render(Counter, { 
		props: { initialCount: 5 } 
	});
	
	const button = getByText('+');
	const display = getByText('5');
	
	await fireEvent.click(button);
	
	expect(getByText('6')).toBeInTheDocument();
});

test('自定義事件測試', async () => {
	const { component, getByText } = render(Counter);
	
	let eventFired = false;
	component.$on('countChanged', (event) => {
		eventFired = true;
		expect(event.detail.count).toBe(1);
	});
	
	await fireEvent.click(getByText('+'));
	expect(eventFired).toBe(true);
});
```

### 測試 Svelte 5 Runes
```javascript
// tests/state.test.js
import { render, fireEvent } from '@testing-library/svelte';
import { expect, test } from 'vitest';

test('$state 響應式測試', async () => {
	const TestComponent = `
		<script>
			let count = $state(0);
			function increment() { count += 1; }
		</script>
		
		<span data-testid="count">{count}</span>
		<button onclick={increment}>+</button>
	`;
	
	const { getByTestId, getByText } = render(TestComponent);
	
	expect(getByTestId('count')).toHaveTextContent('0');
	
	await fireEvent.click(getByText('+'));
	expect(getByTestId('count')).toHaveTextContent('1');
});

test('$derived 計算屬性測試', async () => {
	const TestComponent = `
		<script>
			let count = $state(5);
			let doubled = $derived(count * 2);
		</script>
		
		<span data-testid="doubled">{doubled}</span>
	`;
	
	const { getByTestId } = render(TestComponent);
	expect(getByTestId('doubled')).toHaveTextContent('10');
});
```

### 端對端測試
```javascript
// tests/e2e/app.spec.js
import { test, expect } from '@playwright/test';

test('完整應用程式流程', async ({ page }) => {
	await page.goto('/');
	
	// 檢查初始狀態
	await expect(page.locator('h1')).toHaveText('Svelte 5 應用');
	
	// 與組件互動
	await page.click('button:has-text("增加")');
	await expect(page.locator('[data-testid="count"]')).toHaveText('1');
	
	// 檢查導航
	await page.click('a:has-text("關於")');
	await expect(page).toHaveURL('/about');
});

test('表單提交測試', async ({ page }) => {
	await page.goto('/contact');
	
	await page.fill('[name="name"]', '測試用户');
	await page.fill('[name="email"]', 'test@example.com');
	await page.click('button[type="submit"]');
	
	await expect(page.locator('.success')).toBeVisible();
});
```

---

## 19. 效能優化

### 響應式優化
```svelte
<script>
	import { untrack } from 'svelte';
	
	let users = $state([]);
	let filter = $state('');
	let sortOrder = $state('asc');
	
	// 使用 $derived 進行高效篩選
	let filteredUsers = $derived(() => {
		const filtered = users.filter(user => 
			user.name.toLowerCase().includes(filter.toLowerCase())
		);
		
		return filtered.sort((a, b) => {
			const multiplier = sortOrder === 'asc' ? 1 : -1;
			return a.name.localeCompare(b.name) * multiplier;
		});
	});
	
	// 避免不必要的響應式追蹤
	function logUserCount() {
		untrack(() => {
			console.log('用户數量:', users.length);
		});
	}
	
	// 批量更新以提高效能
	function addMultipleUsers(newUsers) {
		users.push(...newUsers);
	}
</script>

<input bind:value={filter} placeholder="搜尋用户" />
<select bind:value={sortOrder}>
	<option value="asc">升序</option>
	<option value="desc">降序</option>
</select>

{#each filteredUsers as user (user.id)}
	<div>{user.name}</div>
{/each}
```

### 組件懶載入
```svelte
<!-- App.svelte -->
<script>
	import { onMount } from 'svelte';
	
	let showLargeComponent = $state(false);
	let LargeComponent;
	
	async function loadComponent() {
		if (!LargeComponent) {
			const module = await import('./LargeComponent.svelte');
			LargeComponent = module.default;
		}
		showLargeComponent = true;
	}
</script>

<button onclick={loadComponent}>載入大型組件</button>

{#if showLargeComponent && LargeComponent}
	<svelte:component this={LargeComponent} />
{/if}
```

### 記憶化計算
```svelte
<script>
	let data = $state([]);
	let expensive = $state(false);
	
	// 記憶化昂貴的計算
	let expensiveComputation = $derived(() => {
		if (!expensive) return null;
		
		// 模擬昂貴計算
		return data.reduce((acc, item) => {
			return acc + item.value * Math.random();
		}, 0);
	});
	
	// 使用 $effect 進行副作用控制
	$effect(() => {
		if (expensiveComputation !== null) {
			console.log('計算結果:', expensiveComputation);
		}
	});
</script>

<button onclick={() => expensive = !expensive}>
	切換昂貴計算
</button>

{#if expensiveComputation !== null}
	<p>結果: {expensiveComputation.toFixed(2)}</p>
{/if}
```

---

## 20. 遷移指南

### 從 Svelte 4 到 Svelte 5
```javascript
// Svelte 4 語法
let count = 0;
$: doubled = count * 2;
$: {
	console.log('count changed:', count);
}

// Svelte 5 語法
let count = $state(0);
let doubled = $derived(count * 2);
$effect(() => {
	console.log('count changed:', count);
});
```

### 組件 Props 遷移
```svelte
<!-- Svelte 4 -->
<script>
	export let title = '預設標題';
	export let count = 0;
	export let onClick = () => {};
</script>

<!-- Svelte 5 -->
<script>
	let { title = '預設標題', count = 0, onClick = () => {} } = $props();
</script>
```

### 事件處理遷移
```svelte
<!-- Svelte 4 -->
<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		dispatch('clicked', { value: 'hello' });
	}
</script>
<button on:click={handleClick}>點擊</button>

<!-- Svelte 5 -->
<script>
	let { onclick } = $props();
	
	function handleClick() {
		onclick?.({ value: 'hello' });
	}
</script>
<button {onclick}>點擊</button>
```

### Store 與 Runes 整合
```javascript
// 漸進式遷移 - 保留現有 stores
import { writable } from 'svelte/store';

export const count = writable(0);

// 新組件使用 Runes
let countValue = $state(0);
let { subscribe } = count;

$effect(() => {
	return subscribe(value => {
		countValue = value;
	});
});
```

### 遷移檢查清單
1. ✅ 將 `let` 變數改為 `$state()`
2. ✅ 將 `$:` 計算屬性改為 `$derived()`
3. ✅ 將 `$:` 副作用改為 `$effect()`
4. ✅ 將 `export let` 改為 `$props()`
5. ✅ 更新事件處理器語法
6. ✅ 將 `<slot>` 改為 `{#snippet}`
7. ✅ 測試所有功能是否正常

### 從 Svelte 4 到 Svelte 5

#### 狀態管理遷移
```svelte
<!-- Svelte 4 -->
<script>
	let count = 0;
	$: doubled = count * 2;
	$: console.log('Count:', count);
</script>

<!-- Svelte 5 -->
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
	
	$effect(() => {
		console.log('Count:', count);
	});
</script>
```

#### Props 遷移
```svelte
<!-- Svelte 4 -->
<script>
	export let title;
	export let count = 0;
</script>

<!-- Svelte 5 -->
<script>
	let { title, count = 0 } = $props();
</script>
```

#### Store 遷移
```svelte
<!-- Svelte 4 -->
<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
</script>

<!-- Svelte 5 -->
<script>
	// 可以繼續使用 stores，或改用 $state
	let count = $state(0);
</script>
```

---

## 🎯 學習建議

### 初學者路線
1. 先學會基本語法和模板語法
2. 練習組件化開發
3. 理解響應式概念
4. 學習狀態管理

### 進階路線
1. 深入學習 Stores 和 Context
2. 掌握生命週期和組件通訊
3. 學習動畫和過渡效果
4. 探索 Svelte 5 的 Runes

### 實戰項目建議
1. **待辦事項應用** - 練習基本 CRUD 操作
2. **天氣應用** - 學習 API 調用和資料處理
3. **購物車** - 練習狀態管理和組件通訊
4. **部落格** - 學習路由和 SSR

### 有用資源
- [Svelte 官方文檔](https://svelte.dev/)
- [SvelteKit 文檔](https://kit.svelte.dev/)
- [Svelte Society](https://sveltesociety.dev/)
- [Svelte REPL](https://svelte.dev/repl) - 線上練習

---

## 🚀 快速參考

### 常用語法速查
```svelte
<!-- 變數綁定 -->
{variable}
{@html htmlContent}

<!-- 屬性綁定 -->
<div class={className} {id}></div>

<!-- 事件處理 -->
<button onclick={handler}>Click</button>

<!-- 條件渲染 -->
{#if condition}...{:else}...{/if}

<!-- 列表渲染 -->
{#each items as item (item.id)}...{/each}

<!-- 雙向綁定 -->
<input bind:value={text} />

<!-- 插槽 -->
<slot name="header" {data}></slot>

<!-- 組件 -->
<Component prop={value} bind:data on:event />
```

### Svelte 5 Runes 速查
```svelte
<script>
	// 狀態
	let state = $state(initial);
	
	// 衍生值
	let derived = $derived(computation);
	let complex = $derived.by(() => { /* logic */ });
	
	// 副作用
	$effect(() => { /* side effect */ });
	$effect.pre(() => { /* before DOM update */ });
	
	// Props
	let { prop1, prop2 = default } = $props();
	let { bindable = $bindable() } = $props();
	
	// 調試
	$inspect(variable);
</script>
```

恭喜您完成了 Svelte 完整學習指南！現在您已經具備了從基礎到進階的 Svelte 開發技能。建議多做實際練習，並關注 Svelte 5 的新特性。Happy coding! 🎉

# Svelte 完整學習指南 📚

> 從零開始學習 Svelte，涵蓋 Svelte 4 到 Svelte 5 的所有重要概念

## 🎯 學習路線圖

這份指南將帶您從 Svelte 基礎概念一步步學習到進階應用，適合初學者到中級開發者。

---

## 📋 目錄

### 第一部分：基礎入門
1. [專案建立與環境設置](#1-專案建立與環境設置)
2. [Svelte 基本語法](#2-svelte-基本語法)
3. [基礎標記與屬性](#3-基礎標記與屬性)
4. [模板語法](#4-模板語法)
5. [資料綁定](#5-資料綁定)

### 第二部分：進階功能
6. [Snippet 與渲染](#6-snippet-與渲染)
7. [調試與開發工具](#7-調試與開發工具)
8. [Actions 使用](#8-actions-使用)
9. [動畫與過渡](#9-動畫與過渡)
10. [樣式與 CSS](#10-樣式與-css)

### 第三部分：狀態管理
11. [Stores 狀態管理](#11-stores-狀態管理)
12. [Context 上下文](#12-context-上下文)
13. [特殊元素](#13-特殊元素)

### 第四部分：組件生命週期
14. [生命週期鉤子](#14-生命週期鉤子)
15. [組件 API](#15-組件-api)

### 第五部分：Svelte 5 新功能
16. [Runes 響應式原語](#16-runes-響應式原語)
17. [TypeScript 支援](#17-typescript-支援)
18. [自定義元素](#18-自定義元素)
19. [測試](#19-測試)
20. [遷移指南](#20-遷移指南)

---

## 1. 專案建立與環境設置

### 快速開始

#### 方法一：Vite + Svelte（適合 SPA）
```bash
# 建立新專案
yarn create vite svelte-app --template svelte-ts

# 進入專案目錄
cd svelte-app

# 安裝依賴
yarn install

# 啟動開發伺服器
yarn dev
```

#### 方法二：SvelteKit（適合全端應用）
```bash
# 建立 SvelteKit 專案
npx sv create svelte-app

# 選擇模板
# ✓ Which template would you like?
#   › Skeleton project

# 進入專案並安裝
cd svelte-app
npm install

# 啟動開發伺服器
npm run dev
```

### 專案結構
```
svelte-app/
├── src/
│   ├── lib/           # 共用組件和工具
│   ├── routes/        # 路由頁面（SvelteKit）
│   ├── app.html       # HTML 模板
│   └── App.svelte     # 主要組件
├── static/            # 靜態資源
└── package.json
```

---

## 2. Svelte 基本語法

### .svelte 檔案結構

每個 `.svelte` 檔案都包含三個主要部分：

```svelte
<script>
	// JavaScript 邏輯
	let count = 0;
	
	function increment() {
		count += 1;
	}
</script>

<!-- HTML 模板 -->
<div>
	<button on:click={increment}>
		點擊次數: {count}
	</button>
</div>

<style>
	/* CSS 樣式（自動作用域化） */
	button {
		background: #007acc;
		color: white;
		padding: 10px 20px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
```

### 基本概念

- **響應式變數**：當變數改變時，UI 自動更新
- **作用域化 CSS**：樣式只影響當前組件
- **組件化**：可重複使用的 UI 元件

---

## 3. 基礎標記與屬性

### HTML 標籤
```svelte
<script>
	import Widget from './Widget.svelte';
	let isDisabled = true;
	let className = 'primary';
</script>

<!-- 基本標籤 -->
<div class="container">
	<button disabled={isDisabled}>按鈕</button>
	<input type="checkbox" />
</div>

<!-- 屬性綁定 -->
<div class={className}>動態 class</div>
<a href="page/{pageId}">連結</a>

<!-- 屬性簡寫：當屬性名與變數名相同時 -->
<button {disabled}>等同於 disabled={disabled}</button>

<!-- 組件使用 -->
<Widget prop1="值" prop2={variable} />

<!-- 展開屬性 -->
<Widget {...props} />
```

### 組件 Props
```svelte
<!-- 父組件 -->
<script>
	import Child from './Child.svelte';
	let message = "Hello";
	let settings = { theme: 'dark', size: 'large' };
</script>

<Child {message} answer={42} text="hello" />
<Child {...settings} />
```

---

## 4. 模板語法

### 條件渲染
```svelte
<script>
	let user = { name: 'John', age: 25 };
	let temperature = 75;
</script>

<!-- 簡單條件 -->
{#if user}
	<p>歡迎, {user.name}!</p>
{/if}

<!-- 多重條件 -->
{#if temperature > 100}
	<p class="hot">太熱了！</p>
{:else if temperature < 50}
	<p class="cold">太冷了！</p>
{:else}
	<p class="comfortable">溫度剛好</p>
{/if}
```

### 列表渲染
```svelte
<script>
	let items = [
		{ id: 1, name: '蘋果', qty: 3 },
		{ id: 2, name: '香蕉', qty: 5 },
		{ id: 3, name: '橘子', qty: 2 }
	];
</script>

<!-- 基本列表 -->
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>

<!-- 帶索引的列表 -->
<ul>
	{#each items as item, index}
		<li>{index + 1}. {item.name} x {item.qty}</li>
	{/each}
</ul>

<!-- 帶 key 的列表（推薦用於動態列表） -->
<ul>
	{#each items as item (item.id)}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>

<!-- 空狀態處理 -->
{#each items as item}
	<p>{item.name}</p>
{:else}
	<p>沒有項目</p>
{/each}
```

### Key 區塊
```svelte
<script>
	let value = 0;
</script>

<!-- 當 value 改變時，重新創建區塊 -->
{#key value}
	<div>這個區塊會在 value 改變時重建</div>
{/key}
```

### 非同步處理
```svelte
<script>
	let promise = fetchUserData();
	
	async function fetchUserData() {
		const response = await fetch('/api/user');
		return response.json();
	}
</script>

{#await promise}
	<p>載入中...</p>
{:then user}
	<p>Hello {user.name}!</p>
{:catch error}
	<p>發生錯誤: {error.message}</p>
{/await}

<!-- 簡化版本（只處理成功狀態） -->
{#await promise then user}
	<p>Hello {user.name}!</p>
{/await}
```

---

## 5. 資料綁定

### 基本綁定
```svelte
<script>
	let name = '';
	let message = 'Hello';
	let isChecked = false;
	let selectedValue = '';
</script>

<!-- 文字輸入 -->
<input bind:value={name} placeholder="輸入名字" />
<p>你好, {name}!</p>

<!-- 簡寫形式 -->
<input bind:value />

<!-- 核取方塊 -->
<input type="checkbox" bind:checked={isChecked} />
<p>已選取: {isChecked}</p>

<!-- 單選按鈕 -->
<input type="radio" bind:group={selectedValue} value="option1" />
<input type="radio" bind:group={selectedValue} value="option2" />
<p>選擇: {selectedValue}</p>
```

### 進階綁定
```svelte
<script>
	let files;
	let value = '';
	let element;
</script>

<!-- 檔案上傳 -->
<input type="file" bind:files />
{#if files}
	<p>選擇了 {files.length} 個檔案</p>
{/if}

<!-- 下拉選單 -->
<select bind:value>
	<option value="a">A</option>
	<option value="b">B</option>
	<option value="c">C</option>
</select>

<!-- 多選下拉 -->
<select multiple bind:value={selectedOptions}>
	<option value="1">選項 1</option>
	<option value="2">選項 2</option>
	<option value="3">選項 3</option>
</select>

<!-- 元素引用 -->
<div bind:this={element}>
	<p>可以通過 element 變數存取這個 DOM 元素</p>
</div>
```

### 尺寸綁定
```svelte
<script>
	let width;
	let height;
</script>

<div 
	bind:clientWidth={width}
	bind:clientHeight={height}
>
	大小: {width} x {height}
</div>
```

### 組件綁定
```svelte
<!-- 父組件 -->
<script>
	import Child from './Child.svelte';
	let childValue = '';
</script>

<Child bind:value={childValue} />
<p>子組件的值: {childValue}</p>

<!-- 子組件 (Child.svelte) -->
<script>
	export let value = '';
</script>

<input bind:value />
```

---

## 6. Snippet 與渲染

### Snippet 基礎
```svelte
<script>
	let items = ['項目1', '項目2', '項目3'];
</script>

{#snippet listItem(item, index)}
	<li class="item-{index}">
		{index + 1}. {item}
	</li>
{/snippet}

<ul>
	{#each items as item, i}
		{@render listItem(item, i)}
	{/each}
</ul>
```

### 條件 Snippet
```svelte
{#snippet greeting(name)}
	<h1>你好, {name}!</h1>
{/snippet}

{#snippet farewell(name)}
	<h1>再見, {name}!</h1>
{/snippet}

<script>
	let showGreeting = true;
	let userName = 'John';
</script>

{@render showGreeting ? greeting(userName) : farewell(userName)}
```

---

## 7. 調試與開發工具

### HTML 調試
```svelte
<script>
	let user = { name: 'John', age: 25 };
	let items = [1, 2, 3];
</script>

<!-- 輸出 HTML 內容 -->
{@html user.bio}

<!-- 常數值 -->
{@const doubled = count * 2}
<p>雙倍值: {doubled}</p>

<!-- 調試輸出 -->
{@debug user, items}
```

### 開發技巧
```svelte
<script>
	let data = { users: [], loading: true };
	
	// 調試特定狀態
	$: console.log('Data updated:', data);
	
	// 條件調試
	$: if (data.users.length > 0) {
		console.log('Users loaded:', data.users);
	}
</script>
```

---

## 8. Actions 使用

### 基本 Action
```svelte
<script>
	function clickOutside(node) {
		function handleClick(event) {
			if (!node.contains(event.target)) {
				node.dispatchEvent(new CustomEvent('clickoutside'));
			}
		}
		
		document.addEventListener('click', handleClick, true);
		
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
	
	let showModal = false;
</script>

<div 
	class="modal" 
	use:clickOutside 
	on:clickoutside={() => showModal = false}
>
	模態框內容
</div>
```

### 帶參數的 Action
```svelte
<script>
	function tooltip(node, text) {
		let tooltip;
		
		function mouseenter() {
			tooltip = document.createElement('div');
			tooltip.textContent = text;
			tooltip.className = 'tooltip';
			document.body.appendChild(tooltip);
		}
		
		function mouseleave() {
			if (tooltip) {
				tooltip.remove();
				tooltip = null;
			}
		}
		
		node.addEventListener('mouseenter', mouseenter);
		node.addEventListener('mouseleave', mouseleave);
		
		return {
			update(newText) {
				text = newText;
				if (tooltip) {
					tooltip.textContent = text;
				}
			},
			destroy() {
				node.removeEventListener('mouseenter', mouseenter);
				node.removeEventListener('mouseleave', mouseleave);
			}
		};
	}
</script>

<button use:tooltip="這是提示文字">
	懸停看提示
</button>
```

---

## 9. 動畫與過渡

### 基本過渡
```svelte
<script>
	import { fade, fly, scale } from 'svelte/transition';
	let visible = false;
</script>

<button on:click={() => visible = !visible}>
	切換顯示
</button>

{#if visible}
	<p transition:fade>淡入淡出</p>
	<p transition:fly={{ y: 200, duration: 2000 }}>飛入效果</p>
	<p transition:scale={{ start: 0.5 }}>縮放效果</p>
{/if}
```

### 進入與離開動畫
```svelte
<script>
	import { fade, fly } from 'svelte/transition';
	let visible = false;
</script>

{#if visible}
	<p 
		in:fly={{ x: -200 }} 
		out:fade
	>
		不同的進入和離開動畫
	</p>
{/if}
```

### 動畫指令
```svelte
<script>
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	
	let items = [
		{ id: 1, name: '項目 1' },
		{ id: 2, name: '項目 2' },
		{ id: 3, name: '項目 3' }
	];
	
	function shuffle() {
		items = items.sort(() => Math.random() - 0.5);
	}
</script>

<button on:click={shuffle}>打亂順序</button>

{#each items as item (item.id)}
	<div 
		animate:flip={{ duration: 300 }}
		transition:fade
	>
		{item.name}
	</div>
{/each}
```

---

## 10. 樣式與 CSS

### 基本樣式
```svelte
<script>
	let isDark = false;
	let fontSize = 16;
</script>

<!-- Class 綁定 -->
<div class="container" class:dark={isDark}>
	內容
</div>

<!-- 內聯樣式 -->
<p style="font-size: {fontSize}px; color: red;">
	動態樣式
</p>

<!-- 條件 class -->
<button class:active={isActive} class:disabled={!isActive}>
	按鈕
</button>

<style>
	.container {
		padding: 20px;
		background: white;
	}
	
	.container.dark {
		background: #333;
		color: white;
	}
	
	.active {
		background: #007acc;
	}
	
	.disabled {
		opacity: 0.5;
	}
</style>
```

### CSS 變數
```svelte
<script>
	let primaryColor = '#007acc';
	let size = 'large';
</script>

<div 
	class="themed {size}" 
	style="--primary: {primaryColor};"
>
	使用 CSS 變數的主題化元件
</div>

<style>
	.themed {
		background: var(--primary);
		color: white;
		padding: var(--padding);
	}
	
	.large {
		--padding: 20px;
		font-size: 1.2em;
	}
	
	.small {
		--padding: 10px;
		font-size: 0.9em;
	}
</style>
```

### 全域樣式
```svelte
<style>
	:global(body) {
		margin: 0;
		font-family: Arial, sans-serif;
	}
	
	:global(.highlight) {
		background: yellow;
	}
</style>
```

---

## 11. Stores 狀態管理

### Writable Store
```javascript
// stores.js
import { writable } from 'svelte/store';

export const count = writable(0);
export const user = writable(null);
```

```svelte
<!-- App.svelte -->
<script>
	import { count } from './stores.js';
	
	// 訂閱 store
	let countValue;
	count.subscribe(value => {
		countValue = value;
	});
	
	// 或使用響應式語法
	$: console.log('Count changed:', $count);
	
	function increment() {
		count.update(n => n + 1);
	}
	
	function reset() {
		count.set(0);
	}
</script>

<p>計數: {$count}</p>
<button on:click={increment}>+1</button>
<button on:click={reset}>重置</button>
```

### Readable Store
```javascript
// stores.js
import { readable } from 'svelte/store';

export const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);
	
	return function stop() {
		clearInterval(interval);
	};
});
```

### Derived Store
```javascript
// stores.js
import { derived } from 'svelte/store';
import { user } from './user.js';

export const userName = derived(
	user,
	$user => $user ? $user.name : 'Guest'
);

// 多個 store 的衍生
export const fullName = derived(
	[firstName, lastName],
	([$firstName, $lastName]) => `${$firstName} ${$lastName}`
);
```

### 自定義 Store
```javascript
// stores.js
import { writable } from 'svelte/store';

function createCounter() {
	const { subscribe, set, update } = writable(0);
	
	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		reset: () => set(0)
	};
}

export const counter = createCounter();
```

---

## 12. Context 上下文

### 設置 Context
```svelte
<!-- App.svelte -->
<script>
	import { setContext } from 'svelte';
	import Child from './Child.svelte';
	
	const theme = {
		primaryColor: '#007acc',
		fontSize: '16px'
	};
	
	setContext('theme', theme);
</script>

<Child />
```

### 取得 Context
```svelte
<!-- Child.svelte -->
<script>
	import { getContext } from 'svelte';
	
	const theme = getContext('theme');
</script>

<div style="color: {theme.primaryColor}; font-size: {theme.fontSize};">
	使用主題顏色的文字
</div>
```

### 響應式 Context
```svelte
<!-- 父組件 -->
<script>
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	
	const theme = writable({ color: 'blue' });
	setContext('theme', theme);
	
	function changeTheme() {
		theme.update(t => ({ ...t, color: 'red' }));
	}
</script>

<button on:click={changeTheme}>改變主題</button>

<!-- 子組件 -->
<script>
	import { getContext } from 'svelte';
	
	const theme = getContext('theme');
</script>

<div style="color: {$theme.color};">
	主題化文字
</div>
```

---

## 13. 特殊元素

### `<svelte:self>`
```svelte
<!-- Tree.svelte -->
<script>
	export let data;
</script>

{data.name}
{#if data.children}
	<ul>
		{#each data.children as child}
			<li>
				<svelte:self data={child} />
			</li>
		{/each}
	</ul>
{/if}
```

### `<svelte:component>`
```svelte
<script>
	import ComponentA from './ComponentA.svelte';
	import ComponentB from './ComponentB.svelte';
	
	let currentComponent = ComponentA;
	let props = { message: 'Hello' };
</script>

<svelte:component this={currentComponent} {...props} />

<button on:click={() => currentComponent = ComponentB}>
	切換組件
</button>
```

### `<svelte:window>`
```svelte
<script>
	let scrollY;
	let innerWidth;
	
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			alert('按下了 ESC 鍵');
		}
	}
</script>

<svelte:window 
	bind:scrollY 
	bind:innerWidth 
	on:keydown={handleKeydown} 
/>

<p>捲動位置: {scrollY}</p>
<p>視窗寬度: {innerWidth}</p>
```

### `<svelte:document>` 和 `<svelte:body>`
```svelte
<script>
	function handleClick() {
		console.log('點擊了文檔');
	}
	
	function handleMousemove(event) {
		console.log('滑鼠移動:', event.clientX, event.clientY);
	}
</script>

<svelte:document on:click={handleClick} />
<svelte:body on:mousemove={handleMousemove} />
```

---

## 14. 生命週期鉤子

### `onMount`
```svelte
<script>
	import { onMount } from 'svelte';
	
	let data = [];
	
	onMount(async () => {
		console.log('組件已掛載');
		
		// 取得資料
		const response = await fetch('/api/data');
		data = await response.json();
		
		// 返回清理函數
		return () => {
			console.log('組件即將卸載');
		};
	});
</script>

{#each data as item}
	<p>{item.name}</p>
{/each}
```

### `onDestroy`
```svelte
<script>
	import { onDestroy } from 'svelte';
	
	let timer;
	
	onDestroy(() => {
		if (timer) {
			clearInterval(timer);
		}
		console.log('組件被銷毀');
	});
	
	timer = setInterval(() => {
		console.log('計時器觸發');
	}, 1000);
</script>
```

### `tick`
```svelte
<script>
	import { tick } from 'svelte';
	
	let items = [1, 2, 3];
	
	async function addItem() {
		items = [...items, items.length + 1];
		
		// 等待 DOM 更新完成
		await tick();
		
		// 現在可以安全地操作新的 DOM 元素
		const newElement = document.querySelector('.item:last-child');
		newElement.scrollIntoView();
	}
</script>

{#each items as item}
	<div class="item">{item}</div>
{/each}

<button on:click={addItem}>新增項目</button>
```

---

## 15. 組件 API

### 事件轉發
```svelte
<!-- Button.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		dispatch('customClick', {
			message: '自定義事件'
		});
	}
</script>

<button on:click={handleClick}>
	<slot>預設按鈕文字</slot>
</button>

<!-- 使用組件 -->
<script>
	import Button from './Button.svelte';
	
	function handleCustomClick(event) {
		console.log('收到事件:', event.detail.message);
	}
</script>

<Button on:customClick={handleCustomClick}>
	點我
</Button>
```

### Slot 插槽
```svelte
<!-- Card.svelte -->
<div class="card">
	<header>
		<slot name="header">預設標題</slot>
	</header>
	
	<main>
		<slot>預設內容</slot>
	</main>
	
	<footer>
		<slot name="footer" {footerData}>
			預設頁腳
		</slot>
	</footer>
</div>

<!-- 使用組件 -->
<Card>
	<h1 slot="header">自定義標題</h1>
	<p>主要內容</p>
	<div slot="footer" let:footerData>
		自定義頁腳: {footerData}
	</div>
</Card>
```

---

## 16. Runes 響應式原語

> **注意：** Runes 是 Svelte 5 的新功能，提供更強大的響應式系統

### `$state` 狀態管理
```svelte
<script>
	// 基本狀態
	let count = $state(0);
	
	// 物件狀態
	let user = $state({
		name: 'John',
		age: 25
	});
	
	// 陣列狀態
	let todos = $state([
		{ id: 1, text: '學習 Svelte', done: false }
	]);
	
	function addTodo() {
		todos.push({
			id: Date.now(),
			text: '新任務',
			done: false
		});
	}
</script>

<p>計數: {count}</p>
<button onclick={() => count++}>+1</button>

<input bind:value={user.name} />
<p>你好, {user.name}!</p>

{#each todos as todo}
	<div>
		<input type="checkbox" bind:checked={todo.done} />
		{todo.text}
	</div>
{/each}

<button onclick={addTodo}>新增任務</button>
```

### `$derived` 衍生值
```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
	
	// 複雜衍生
	let statistics = $derived.by(() => {
		return {
			isEven: count % 2 === 0,
			square: count ** 2,
			description: count > 10 ? '大數字' : '小數字'
		};
	});
</script>

<p>原值: {count}</p>
<p>雙倍: {doubled}</p>
<p>平方: {statistics.square}</p>
<p>描述: {statistics.description}</p>
```

### `$effect` 副作用
```svelte
<script>
	let count = $state(0);
	
	// 基本副作用
	$effect(() => {
		console.log('Count changed to:', count);
		document.title = `計數: ${count}`;
	});
	
	// 清理副作用
	$effect(() => {
		const interval = setInterval(() => {
			console.log('定時器觸發');
		}, 1000);
		
		return () => clearInterval(interval);
	});
</script>
```

### `$props` 和 `$bindable`
```svelte
<!-- 父組件 -->
<script>
	import Child from './Child.svelte';
	
	let message = $state('Hello');
</script>

<Child bind:value={message} title="子組件" />
<p>當前值: {message}</p>

<!-- 子組件 (Child.svelte) -->
<script>
	let { value = $bindable(''), title } = $props();
</script>

<h3>{title}</h3>
<input bind:value />
```

### `$inspect` 調試
```svelte
<script>
	let count = $state(0);
	let name = $state('用戶');
	
	// 自動調試狀態變化
	$inspect(count, name);
	
	// 自定義調試處理
	$inspect(count).with((type, value) => {
		if (type === 'update') {
			console.warn('Count updated:', value);
		}
	});
</script>
```

---

## 17. TypeScript 支援

### 基本 TypeScript 設置
```svelte
<script lang="ts">
	interface User {
		id: number;
		name: string;
		email: string;
	}
	
	let users: User[] = [];
	let selectedUser: User | null = null;
	
	async function fetchUsers(): Promise<User[]> {
		const response = await fetch('/api/users');
		return response.json();
	}
	
	function selectUser(user: User): void {
		selectedUser = user;
	}
</script>

{#each users as user}
	<button on:click={() => selectUser(user)}>
		{user.name}
	</button>
{/each}

{#if selectedUser}
	<p>選擇的用戶: {selectedUser.name}</p>
{/if}
```

### 組件 Props 類型
```svelte
<!-- Component.svelte -->
<script lang="ts">
	interface Props {
		title: string;
		count?: number;
		onClick?: (value: number) => void;
	}
	
	let { title, count = 0, onClick }: Props = $props();
</script>

<h2>{title}</h2>
<button onclick={() => onClick?.(count + 1)}>
	計數: {count}
</button>
```

---

## 18. 自定義元素

### 建立 Web Component
```svelte
<svelte:options customElement="my-counter" />

<script>
	let count = $state(0);
	
	function dispatch(eventName: string, detail: any) {
		$host().dispatchEvent(new CustomEvent(eventName, { detail }));
	}
	
	function increment() {
		count++;
		dispatch('countChanged', { count });
	}
</script>

<div class="counter">
	<button onclick={increment}>計數: {count}</button>
</div>

<style>
	.counter {
		display: inline-block;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
</style>
```

### 使用自定義元素
```html
<script type="module" src="./my-counter.js"></script>

<my-counter></my-counter>

<script>
	document.querySelector('my-counter').addEventListener('countChanged', (e) => {
		console.log('計數變更:', e.detail.count);
	});
</script>
```

---

## 19. 測試

### 組件測試
```javascript
// Button.test.js
import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

test('should render button with text', () => {
	const { getByText } = render(Button, {
		props: { text: 'Click me' }
	});
	
	expect(getByText('Click me')).toBeInTheDocument();
});

test('should handle click events', async () => {
	const { getByRole } = render(Button);
	const button = getByRole('button');
	
	await fireEvent.click(button);
	
	// 驗證點擊後的行為
});
```

### Store 測試
```javascript
// store.test.js
import { get } from 'svelte/store';
import { counter } from './stores.js';

test('counter should increment', () => {
	counter.reset();
	expect(get(counter)).toBe(0);
	
	counter.increment();
	expect(get(counter)).toBe(1);
});
```

---

## 20. 遷移指南

### 從 Svelte 4 到 Svelte 5

#### 狀態管理遷移
```svelte
<!-- Svelte 4 -->
<script>
	let count = 0;
	$: doubled = count * 2;
	$: console.log('Count:', count);
</script>

<!-- Svelte 5 -->
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
	
	$effect(() => {
		console.log('Count:', count);
	});
</script>
```

#### Props 遷移
```svelte
<!-- Svelte 4 -->
<script>
	export let title;
	export let count = 0;
</script>

<!-- Svelte 5 -->
<script>
	let { title, count = 0 } = $props();
</script>
```

#### Store 遷移
```svelte
<!-- Svelte 4 -->
<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
</script>

<!-- Svelte 5 -->
<script>
	// 可以繼續使用 stores，或改用 $state
	let count = $state(0);
</script>
```

---

## 🎯 學習建議

### 初學者路線
1. 先學會基本語法和模板語法
2. 練習組件化開發
3. 理解響應式概念
4. 學習狀態管理

### 進階路線
1. 深入學習 Stores 和 Context
2. 掌握生命週期和組件通訊
3. 學習動畫和過渡效果
4. 探索 Svelte 5 的 Runes

### 實戰項目建議
1. **待辦事項應用** - 練習基本 CRUD 操作
2. **天氣應用** - 學習 API 調用和資料處理
3. **購物車** - 練習狀態管理和組件通訊
4. **部落格** - 學習路由和 SSR

### 有用資源
- [Svelte 官方文檔](https://svelte.dev/)
- [SvelteKit 文檔](https://kit.svelte.dev/)
- [Svelte Society](https://sveltesociety.dev/)
- [Svelte REPL](https://svelte.dev/repl) - 線上練習

---

## 🚀 快速參考

### 常用語法速查
```svelte
<!-- 變數綁定 -->
{variable}
{@html htmlContent}

<!-- 屬性綁定 -->
<div class={className} {id}></div>

<!-- 事件處理 -->
<button on:click={handler}>Click</button>

<!-- 條件渲染 -->
{#if condition}...{:else}...{/if}

<!-- 列表渲染 -->
{#each items as item (item.id)}...{/each}

<!-- 雙向綁定 -->
<input bind:value={text} />

<!-- 插槽 -->
<slot name="header" {data}></slot>

<!-- 組件 -->
<Component prop={value} bind:data on:event />
```

### Svelte 5 Runes 速查
```svelte
<script>
	// 狀態
	let state = $state(initial);
	
	// 衍生值
	let derived = $derived(computation);
	let complex = $derived.by(() => { /* logic */ });
	
	// 副作用
	$effect(() => { /* side effect */ });
	$effect.pre(() => { /* before DOM update */ });
	
	// Props
	let { prop1, prop2 = default } = $props();
	let { bindable = $bindable() } = $props();
	
	// 調試
	$inspect(variable);
</script>
```

恭喜您完成了 Svelte 完整學習指南！現在您已經具備了從基礎到進階的 Svelte 開發技能。建議多做實際練習，並關注 Svelte 5 的新特性。Happy coding! 🎉

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

# page.data

## 概述

`page.data` 是 SvelteKit 中一個特殊的響應式對象，它包含了所有 `load` 函數（包括頁面和布局）返回的合併數據。它的主要用途是讓父級布局能夠存取來自子頁面或子布局的數據。

## 基本概念

### 數據流向的反轉

通常數據是從父級流向子級：
```
Layout → Page (正常數據流)
```

但有時我們需要相反的效果：
```
Page → Layout (反向數據存取)
```

## 基本用法

### 在根布局中存取頁面標題

````svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.data.title}</title>
</svelte:head>

<main>
	{@render children()}
</main>
````

````javascript
// src/routes/blog/[slug]/+page.server.js
export async function load({ params }) {
	const post = await getPost(params.slug);
	
	return {
		title: post.title, // 會出現在 page.data.title
		post
	};
}
````

## 實際應用範例

### 動態標題和 SEO 元數據

````svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { page } from '$app/state';
	
	// 預設值
	let title = $derived(page.data.title || 'My Website');
	let description = $derived(page.data.description || 'Welcome to my website');
	let image = $derived(page.data.image || '/default-og-image.jpg');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:url" content={page.url.href} />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
</svelte:head>
````

````javascript
// src/routes/blog/[slug]/+page.server.js
export async function load({ params }) {
	const post = await getPost(params.slug);
	
	return {
		title: `${post.title} | My Blog`,
		description: post.excerpt,
		image: post.featuredImage,
		post
	};
}
````

````javascript
// src/routes/products/[id]/+page.server.js
export async function load({ params }) {
	const product = await getProduct(params.id);
	
	return {
		title: `${product.name} - $${product.price} | My Shop`,
		description: product.description,
		image: product.images[0],
		product
	};
}
````

### 麵包屑導航

````svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { page } from '$app/state';
	
	let breadcrumbs = $derived(page.data.breadcrumbs || []);
</script>

{#if breadcrumbs.length > 0}
	<nav class="breadcrumbs">
		{#each breadcrumbs as crumb, i}
			{#if i === breadcrumbs.length - 1}
				<span class="current">{crumb.title}</span>
			{:else}
				<a href={crumb.url}>{crumb.title}</a>
				<span class="separator">></span>
			{/if}
		{/each}
	</nav>
{/if}
````

````javascript
// src/routes/shop/category/[categoryId]/product/[productId]/+page.server.js
export async function load({ params }) {
	const [category, product] = await Promise.all([
		getCategory(params.categoryId),
		getProduct(params.productId)
	]);
	
	return {
		title: product.name,
		breadcrumbs: [
			{ title: 'Home', url: '/' },
			{ title: 'Shop', url: '/shop' },
			{ title: category.name, url: `/shop/category/${category.id}` },
			{ title: product.name, url: `/shop/category/${category.id}/product/${product.id}` }
		],
		category,
		product
	};
}
````

### 主題和樣式控制

````svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { page } from '$app/state';
	
	let theme = $derived(page.data.theme || 'default');
	let layoutClass = $derived(page.data.layoutClass || '');
</script>

<div class="app {theme} {layoutClass}">
	{@render children()}
</div>

<style>
	.app.dark {
		background: #1a1a1a;
		color: #ffffff;
	}
	
	.app.minimal {
		padding: 0;
		margin: 0;
	}
	
	.app.full-width {
		max-width: none;
	}
</style>
````

````javascript
// src/routes/admin/+layout.server.js
export async function load() {
	return {
		theme: 'dark',
		layoutClass: 'full-width'
	};
}
````

````javascript
// src/routes/landing/+page.server.js
export async function load() {
	return {
		title: 'Welcome to Our Service',
		theme: 'minimal',
		layoutClass: 'landing-page'
	};
}
````

### 條件式導航顯示

````svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { page } from '$app/state';
	
	let showNavigation = $derived(page.data.showNavigation !== false);
	let showFooter = $derived(page.data.showFooter !== false);
	let navigationStyle = $derived(page.data.navigationStyle || 'default');
</script>

{#if showNavigation}
	<nav class="navigation {navigationStyle}">
		<!-- 導航內容 -->
	</nav>
{/if}

<main>
	{@render children()}
</main>

{#if showFooter}
	<footer>
		<!-- 頁腳內容 -->
	</footer>
{/if}
````

````javascript
// src/routes/auth/+layout.server.js
export async function load() {
	return {
		showNavigation: false,
		showFooter: false
	};
}
````

````javascript
// src/routes/dashboard/+layout.server.js
export async function load() {
	return {
		navigationStyle: 'sidebar',
		title: 'Dashboard'
	};
}
````

## 型別定義

### 自定義 App.PageData

````typescript
// src/app.d.ts
declare global {
	namespace App {
		interface PageData {
			title?: string;
			description?: string;
			image?: string;
			breadcrumbs?: Array<{ title: string; url: string }>;
			theme?: 'light' | 'dark' | 'minimal';
			layoutClass?: string;
			showNavigation?: boolean;
			showFooter?: boolean;
			navigationStyle?: 'default' | 'sidebar' | 'minimal';
		}
	}
}

export {};
````

### 使用型別安全的方式存取數據

````svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	
	// 型別安全的存取
	let pageData: PageData = $derived(page.data);
	let title: string = $derived(pageData.title || 'Default Title');
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
````

## 注意事項

### 1. 版本相容性

````javascript
// SvelteKit 2.12+ (推薦)
import { page } from '$app/state';

// Svelte 4 或早期版本
import { page } from '$app/stores';
// 使用方式: $page.data.title
````

### 2. 響應性

`page.data` 會隨著路由變化自動更新：

````svelte
<script>
	import { page } from '$app/state';
	
	// 這會在路由改變時自動更新
	let currentTitle = $derived(page.data.title);
	
	// 監聽變化
	$effect(() => {
		console.log('Title changed to:', page.data.title);
	});
</script>
````

### 3. 數據合併

`page.data` 包含所有層級的合併數據：

````javascript
// Layout 返回: { a: 1, b: 2 }
// Page 返回: { b: 3, c: 4 }
// page.data 結果: { a: 1, b: 3, c: 4 }
````

### 4. 效能考量

避免在 `page.data` 中放置大量不必要的數據：

````javascript
// ❌ 避免傳遞大量不需要的數據到布局
export async function load() {
	const hugeDatabaseDump = await getAllData(); // 大量數據
	
	return {
		title: 'Page Title',
		hugeDatabaseDump // 布局可能不需要這些
	};
}

// ✅ 只傳遞布局需要的數據
export async function load() {
	const post = await getPost();
	
	return {
		title: post.title,
		description: post.excerpt,
		post // 頁面組件需要的完整數據
	};
}
````

`page.data` 提供了一個強大的機制來實現反向數據流，讓父級組件能夠根據子級頁面的內容進行動態調整，特別適用於 SEO、主題控制和條件式 UI 渲染。
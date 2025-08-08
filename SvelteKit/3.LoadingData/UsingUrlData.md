# Using URL data

## 概述

在 SvelteKit 的 `load` 函數中，你可以存取 URL 相關的資訊來根據路由和查詢參數載入不同的數據。主要提供三個屬性：`url`、`route` 和 `params`。

## URL 屬性

### url 物件

`url` 是一個標準的 `URL` 實例，包含所有 URL 相關的資訊：

````javascript
// URL: https://example.com/blog/post-1?page=2&sort=date#comments

/** @type {import('./$types').PageLoad} */
export function load({ url }) {
	console.log(url.origin);      // 'https://example.com'
	console.log(url.hostname);    // 'example.com'
	console.log(url.pathname);    // '/blog/post-1'
	console.log(url.search);      // '?page=2&sort=date'
	console.log(url.searchParams); // URLSearchParams 物件
	
	// ❗ url.hash 在服務端不可用
	// console.log(url.hash); // 在 load 函數中無法存取
}
````

### searchParams 詳細用法

````javascript
// URL: /products?category=electronics&price_min=100&price_max=500&tags=phone&tags=wireless

/** @type {import('./$types').PageLoad} */
export function load({ url }) {
	const searchParams = url.searchParams;
	
	// 取得單一參數
	const category = searchParams.get('category'); // 'electronics'
	const minPrice = searchParams.get('price_min'); // '100'
	
	// 取得多重參數
	const tags = searchParams.getAll('tags'); // ['phone', 'wireless']
	
	// 檢查參數是否存在
	const hasSort = searchParams.has('sort'); // false
	
	// 轉換為物件
	const filters = Object.fromEntries(searchParams);
	// { category: 'electronics', price_min: '100', price_max: '500', tags: 'wireless' }
	
	return {
		category,
		priceRange: { min: parseInt(minPrice) || 0, max: parseInt(searchParams.get('price_max')) || Infinity },
		tags,
		filters
	};
}
````

## Route 屬性

### route.id

包含路由的結構化路徑名稱：

````javascript
// 檔案: src/routes/a/[b]/[...c]/+page.js

/** @type {import('./$types').PageLoad} */
export function load({ route }) {
	console.log(route.id); // '/a/[b]/[...c]'
	
	// 可用於條件邏輯
	if (route.id.includes('[...')) {
		console.log('這是一個 rest 參數路由');
	}
}
````

## Params 屬性

### 基本參數解析

````javascript
// 路由: /blog/[slug]/+page.js
// URL: /blog/hello-world

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	console.log(params.slug); // 'hello-world'
	
	return {
		slug: params.slug
	};
}
````

### 複雜參數範例

````javascript
// 路由: /shop/[category]/[productId]/reviews/[...rest]/+page.js
// URL: /shop/electronics/phone-123/reviews/recent/verified

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	console.log(params.category);   // 'electronics'
	console.log(params.productId);  // 'phone-123'
	console.log(params.rest);       // 'recent/verified'
	
	// 解析 rest 參數
	const restParts = params.rest.split('/');
	console.log(restParts); // ['recent', 'verified']
	
	return {
		category: params.category,
		productId: params.productId,
		reviewFilters: restParts
	};
}
````

## 實際應用範例

### 產品列表頁面

````javascript
// src/routes/products/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch }) {
	const searchParams = url.searchParams;
	
	// 解析篩選參數
	const filters = {
		category: searchParams.get('category') || '',
		search: searchParams.get('search') || '',
		priceMin: parseInt(searchParams.get('price_min')) || 0,
		priceMax: parseInt(searchParams.get('price_max')) || Infinity,
		sort: searchParams.get('sort') || 'name',
		page: parseInt(searchParams.get('page')) || 1,
		limit: parseInt(searchParams.get('limit')) || 20
	};
	
	// 建構 API 查詢
	const apiParams = new URLSearchParams({
		category: filters.category,
		search: filters.search,
		price_min: filters.priceMin.toString(),
		price_max: filters.priceMax === Infinity ? '' : filters.priceMax.toString(),
		sort: filters.sort,
		page: filters.page.toString(),
		limit: filters.limit.toString()
	});
	
	// 過濾空值
	for (const [key, value] of [...apiParams]) {
		if (!value) apiParams.delete(key);
	}
	
	const response = await fetch(`/api/products?${apiParams}`);
	const data = await response.json();
	
	return {
		products: data.products,
		filters,
		pagination: {
			currentPage: filters.page,
			totalPages: data.totalPages,
			totalItems: data.totalItems
		}
	};
}
````

````svelte
<!-- src/routes/products/+page.svelte -->
<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	
	function updateFilters(newFilters) {
		const url = new URL($page.url);
		
		// 更新搜尋參數
		Object.entries(newFilters).forEach(([key, value]) => {
			if (value && value !== '') {
				url.searchParams.set(key, value.toString());
			} else {
				url.searchParams.delete(key);
			}
		});
		
		// 重置分頁
		url.searchParams.delete('page');
		
		goto(url);
	}
	
	function goToPage(pageNumber) {
		const url = new URL($page.url);
		url.searchParams.set('page', pageNumber.toString());
		goto(url);
	}
</script>

<div class="filters">
	<input 
		type="search" 
		placeholder="搜尋產品..."
		value={data.filters.search}
		oninput={(e) => updateFilters({ search: e.target.value })}
	>
	
	<select 
		value={data.filters.category}
		onchange={(e) => updateFilters({ category: e.target.value })}
	>
		<option value="">所有分類</option>
		<option value="electronics">電子產品</option>
		<option value="clothing">服飾</option>
	</select>
	
	<select 
		value={data.filters.sort}
		onchange={(e) => updateFilters({ sort: e.target.value })}
	>
		<option value="name">名稱</option>
		<option value="price">價格</option>
		<option value="date">日期</option>
	</select>
</div>

<div class="products">
	{#each data.products as product}
		<div class="product-card">
			<h3>{product.name}</h3>
			<p>${product.price}</p>
		</div>
	{/each}
</div>

<div class="pagination">
	{#each Array(data.pagination.totalPages) as _, i}
		<button 
			onclick={() => goToPage(i + 1)}
			class:active={data.pagination.currentPage === i + 1}
		>
			{i + 1}
		</button>
	{/each}
</div>
````

### 部落格文章頁面

````javascript
// src/routes/blog/[slug]/+page.server.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const { slug } = params;
	
	// 從 URL 取得額外參數
	const preview = url.searchParams.has('preview');
	const version = url.searchParams.get('version');
	
	// 根據參數載入不同版本的文章
	let post;
	if (preview && version) {
		post = await getPostDraft(slug, version);
	} else if (preview) {
		post = await getPostDraft(slug);
	} else {
		post = await getPublishedPost(slug);
	}
	
	if (!post) {
		error(404, '文章未找到');
	}
	
	// 載入相關文章
	const relatedPosts = await getRelatedPosts(post.tags, post.id);
	
	return {
		post,
		relatedPosts,
		isPreview: preview,
		version: version || null
	};
}
````

### 搜尋頁面

````javascript
// src/routes/search/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch }) {
	const query = url.searchParams.get('q') || '';
	const type = url.searchParams.get('type') || 'all';
	const page = parseInt(url.searchParams.get('page')) || 1;
	
	if (!query.trim()) {
		return {
			query: '',
			results: [],
			suggestions: await fetch('/api/search/suggestions').then(r => r.json())
		};
	}
	
	// 執行搜尋
	const searchParams = new URLSearchParams({
		q: query,
		type: type,
		page: page.toString()
	});
	
	const [searchResults, suggestions] = await Promise.all([
		fetch(`/api/search?${searchParams}`).then(r => r.json()),
		fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`).then(r => r.json())
	]);
	
	return {
		query,
		type,
		results: searchResults.results,
		pagination: searchResults.pagination,
		suggestions: suggestions.suggestions || []
	};
}
````

### 多語言支援

````javascript
// src/routes/[lang]/products/[id]/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
	const { lang, id } = params;
	
	// 驗證語言
	const supportedLangs = ['en', 'zh-tw', 'ja'];
	if (!supportedLangs.includes(lang)) {
		error(404, '不支援的語言');
	}
	
	// 取得本地化內容
	const response = await fetch(`/api/products/${id}?lang=${lang}`);
	const product = await response.json();
	
	// 檢查是否有變體參數
	const variant = url.searchParams.get('variant');
	if (variant) {
		const variantData = await fetch(`/api/products/${id}/variants/${variant}?lang=${lang}`)
			.then(r => r.json());
		
		return {
			product: { ...product, selectedVariant: variantData },
			lang,
			availableVariants: product.variants
		};
	}
	
	return {
		product,
		lang,
		availableVariants: product.variants || []
	};
}
````

## 進階技巧

### URL 狀態同步

````javascript
// src/routes/dashboard/analytics/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ url }) {
	// 從 URL 恢復狀態
	const state = {
		dateRange: {
			start: url.searchParams.get('start') || getDefaultStartDate(),
			end: url.searchParams.get('end') || getDefaultEndDate()
		},
		metrics: url.searchParams.getAll('metric').length > 0 
			? url.searchParams.getAll('metric')
			: ['views', 'clicks'],
		groupBy: url.searchParams.get('group_by') || 'day'
	};
	
	return {
		analyticsState: state,
		// 將狀態序列化回 URL 的輔助函數
		urlFromState: (newState) => {
			const params = new URLSearchParams();
			params.set('start', newState.dateRange.start);
			params.set('end', newState.dateRange.end);
			newState.metrics.forEach(metric => params.append('metric', metric));
			params.set('group_by', newState.groupBy);
			return `?${params}`;
		}
	};
}
````

### 動態路由驗證

````javascript
// src/routes/users/[userId]/posts/[postId]/+page.server.js
/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const { userId, postId } = params;
	
	// 驗證 ID 格式
	if (!/^\d+$/.test(userId) || !/^\d+$/.test(postId)) {
		error(400, '無效的 ID 格式');
	}
	
	// 檢查編輯模式
	const editMode = url.searchParams.has('edit');
	
	const [user, post] = await Promise.all([
		getUser(userId),
		getPost(postId)
	]);
	
	if (!user || !post) {
		error(404, '資源未找到');
	}
	
	// 驗證文章屬於該用户
	if (post.authorId !== user.id) {
		error(404, '文章不存在');
	}
	
	return {
		user,
		post,
		editMode
	};
}
````

## 注意事項

### 1. Hash 在服務端不可用

````javascript
// ❌ 這在 load 函數中不會工作
export function load({ url }) {
	console.log(url.hash); // 在服務端總是空字串
}

// ✅ 如果需要 hash，在客户端處理
// 在 +page.svelte 中
import { page } from '$app/state';
let hash = $derived($page.url.hash);
````

### 2. 參數型別轉換

````javascript
// URL 參數總是字串，需要手動轉換
export function load({ url }) {
	const page = parseInt(url.searchParams.get('page')) || 1;
	const isActive = url.searchParams.get('active') === 'true';
	const tags = url.searchParams.getAll('tag'); // 字串陣列
}
````

### 3. URL 編碼處理

````javascript
export function load({ url }) {
	// 自動解碼
	const search = url.searchParams.get('q'); // '中文搜尋' (已解碼)
	
	// 如果需要編碼用於 API 呼叫
	const encodedSearch = encodeURIComponent(search);
}
````

使用 URL 數據讓你能夠建立可書籤、可分享且狀態持久的應用程式，這是現代 web 應用程式的重要特性。

# Layout data

## 概述

Layout data 是從 `+layout.js` 或 `+layout.server.js` 文件中的 `load` 函數返回的數據，這些數據可供布局組件本身以及其所有子組件（包括頁面和嵌套布局）使用。

## 基本用法

### 定義 Layout Load 函數

````javascript
// src/routes/blog/+layout.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		posts: await db.getPostSummaries(),
		categories: await db.getCategories()
	};
}
````

### 在布局組件中使用數據

````svelte
<!-- src/routes/blog/+layout.svelte -->
<script>
	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();
</script>

<main>
	<!-- 子頁面在此處渲染 -->
	{@render children()}
</main>

<aside>
	<h2>Categories</h2>
	<ul>
		{#each data.categories as category}
			<li>
				<a href="/blog/category/{category.slug}">
					{category.name} ({category.count})
				</a>
			</li>
		{/each}
	</ul>

	<h2>Recent Posts</h2>
	<ul>
		{#each data.posts as post}
			<li>
				<a href="/blog/{post.slug}">
					{post.title}
				</a>
			</li>
		{/each}
	</ul>
</aside>
````

### 在子頁面中存取布局數據

````svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
	import { page } from '$app/state';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	// 可以存取來自父布局的數據
	let index = $derived(
		data.posts.findIndex(post => post.slug === $page.params.slug)
	);
	let next = $derived(data.posts[index + 1]);
</script>

<article>
	<h1>{data.post.title}</h1>
	<div>{@html data.post.content}</div>
</article>

{#if next}
	<p>Next post: <a href="/blog/{next.slug}">{next.title}</a></p>
{/if}
````

## 進階應用範例

### 多層嵌套布局

````javascript
// src/routes/+layout.server.js (根布局)
export async function load({ locals }) {
	return {
		user: locals.user,
		navigation: await getMainNavigation()
	};
}
````

````javascript
// src/routes/admin/+layout.server.js (管理員布局)
import { redirect } from '@sveltejs/kit';

export async function load({ parent, locals }) {
	const { user } = await parent();
	
	if (!user || !user.isAdmin) {
		redirect(303, '/login');
	}

	return {
		adminMenuItems: await getAdminMenuItems(),
		permissions: user.permissions
	};
}
````

````javascript
// src/routes/admin/users/+layout.server.js (用戶管理布局)
export async function load({ parent }) {
	const { permissions } = await parent();
	
	if (!permissions.includes('manage-users')) {
		error(403, 'Insufficient permissions');
	}

	return {
		userStats: await getUserStatistics(),
		roles: await getAllRoles()
	};
}
````

### 條件式數據載入

````javascript
// src/routes/shop/+layout.server.js
export async function load({ locals, url }) {
	const baseData = {
		categories: await getProductCategories()
	};

	// 只有登入用戶才載入購物車和願望清單
	if (locals.user) {
		const [cart, wishlist] = await Promise.all([
			getShoppingCart(locals.user.id),
			getWishlist(locals.user.id)
		]);

		return {
			...baseData,
			cart,
			wishlist
		};
	}

	return baseData;
}
````

### 響應式導航選單

````svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { page } from '$app/state';
	
	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();

	let currentPath = $derived($page.url.pathname);
</script>

<header>
	<nav>
		{#each data.navigation as item}
			<a 
				href={item.path}
				class:active={currentPath.startsWith(item.path)}
			>
				{item.title}
			</a>
		{/each}
	</nav>

	{#if data.user}
		<div class="user-menu">
			<span>Welcome, {data.user.name}</span>
			<a href="/profile">Profile</a>
			<form method="POST" action="/logout">
				<button>Logout</button>
			</form>
		</div>
	{:else}
		<div class="auth-links">
			<a href="/login">Login</a>
			<a href="/register">Register</a>
		</div>
	{/if}
</header>

<main>
	{@render children()}
</main>
````

## 數據合併行為

當多個 load 函數返回相同鍵的數據時，後執行的會覆蓋前面的：

````javascript
// src/routes/+layout.server.js
export async function load() {
	return {
		title: 'My Site',
		theme: 'light',
		user: await getCurrentUser()
	};
}
````

````javascript
// src/routes/blog/+layout.server.js
export async function load() {
	return {
		title: 'Blog Section', // 覆蓋根布局的 title
		posts: await getRecentPosts()
		// user 和 theme 仍然可用
	};
}
````

````javascript
// src/routes/blog/[slug]/+page.server.js
export async function load({ params }) {
	return {
		title: 'Specific Post Title', // 再次覆蓋 title
		post: await getPost(params.slug)
		// user, theme, posts 都仍然可用
	};
}
````

## 使用 parent() 存取父級數據

````javascript
// src/routes/blog/[slug]/+page.server.js
export async function load({ params, parent }) {
	// 等待父級布局數據載入完成
	const { posts, categories } = await parent();
	
	const post = await getPost(params.slug);
	
	// 找出相關分類
	const postCategory = categories.find(cat => 
		cat.id === post.categoryId
	);
	
	// 找出同分類的其他文章
	const relatedPosts = posts.filter(p => 
		p.categoryId === post.categoryId && p.slug !== params.slug
	);

	return {
		post,
		postCategory,
		relatedPosts
	};
}
````

## 效能最佳化

### 條件式載入

````javascript
// src/routes/dashboard/+layout.server.js
export async function load({ locals, url }) {
	// 基本數據總是載入
	const baseData = {
		user: locals.user,
		notifications: await getNotifications(locals.user.id)
	};

	// 只在特定頁面載入額外數據
	if (url.pathname.includes('/analytics')) {
		baseData.analyticsData = await getAnalyticsData();
	}

	if (url.pathname.includes('/settings')) {
		baseData.settings = await getUserSettings(locals.user.id);
	}

	return baseData;
}
````

### 並行載入

````javascript
// src/routes/ecommerce/+layout.server.js
export async function load({ locals }) {
	const userId = locals.user?.id;

	// 並行載入所有需要的數據
	const [
		categories,
		cart,
		wishlist,
		recentlyViewed
	] = await Promise.all([
		getProductCategories(),
		userId ? getShoppingCart(userId) : Promise.resolve(null),
		userId ? getWishlist(userId) : Promise.resolve(null),
		userId ? getRecentlyViewed(userId) : Promise.resolve([])
	]);

	return {
		categories,
		cart,
		wishlist,
		recentlyViewed
	};
}
````

## 錯誤處理

````javascript
// src/routes/api-dashboard/+layout.server.js
export async function load({ locals }) {
	try {
		const [user, apiKeys, usage] = await Promise.all([
			validateUser(locals.user),
			getApiKeys(locals.user.id),
			getApiUsage(locals.user.id)
		]);

		return {
			user,
			apiKeys,
			usage
		};
	} catch (error) {
		if (error.code === 'UNAUTHORIZED') {
			redirect(303, '/login');
		}
		
		if (error.code === 'API_UNAVAILABLE') {
			return {
				user: locals.user,
				apiKeys: [],
				usage: null,
				error: 'API service temporarily unavailable'
			};
		}

		throw error;
	}
}
````

Layout data 提供了一個強大的機制來在整個應用程式中共享數據，同時保持良好的組織結構和性能。正確使用可以大大簡化狀態管理和數據流。

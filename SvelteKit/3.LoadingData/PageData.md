好的！我來為您重新詳細教學這份 **Page Data** 的內容。

## 🎯 Page Data 概述

**Page Data** 是 SvelteKit 中頁面組件獲取資料的核心機制。它讓我們能夠在頁面渲染前準備好所需的資料，確保用戶看到完整的內容。

---

## 📄 基本概念與用法

### 資料流程

```
Load 函數 → 獲取資料 → 傳遞給組件 → 渲染頁面
```

### 在頁面組件中接收資料

````svelte
<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	// Svelte 4 語法
	// export let data
</script>

<h1>{data.title}</h1>
<div>{@html data.content}</div>
````

**重點說明**：
- 使用 `let { data } = $props()` 接收資料（Svelte 5）
- `data` 包含所有 load 函數返回的資料
- TypeScript 提供完整的型別提示

---

## 🌐 Universal Load 函數 (+page.js)

### 特性與適用場景

**Universal Load** 可以在服務端和客戶端執行，適合：
- 呼叫公開 API
- 處理路由參數
- 客戶端也需要執行的邏輯

### 基本範例

````javascript
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	if (params.slug === 'hello-world') {
		return {
			title: 'Hello world!',
			content: 'Welcome to our blog. Lorem ipsum dolor sit amet...'
		};
	}

	error(404, 'Not found');
}
````

### 進階範例：API 呼叫

````javascript
// filepath: src/routes/products/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
	const category = url.searchParams.get('category') || '';
	const page = url.searchParams.get('page') || '1';
	
	const response = await fetch(`/api/products?category=${category}&page=${page}`);
	
	if (!response.ok) {
		error(response.status, 'Failed to load products');
	}

	const data = await response.json();
	
	return {
		products: data.products,
		totalPages: data.totalPages,
		currentPage: parseInt(page),
		currentCategory: category
	};
}
````

---

## 🖥️ Server Load 函數 (+page.server.js)

### 特性與適用場景

**Server Load** 只在服務端執行，適合：
- 資料庫直接存取
- 使用私密環境變數
- 處理身份驗證
- 存取檔案系統

### 基本範例

````javascript
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
````

### 進階範例：身份驗證與權限

````javascript
/users/[id]/+page.server.js
import { error, redirect } from '@sveltejs/kit';
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals, cookies }) {
	// 檢查身份驗證
	if (!locals.user) {
		redirect(302, '/login');
	}

	// 檢查管理員權限
	if (!locals.user.isAdmin) {
		error(403, 'Access denied');
	}

	const userId = params.id;
	const user = await db.getUser(userId);
	
	if (!user) {
		error(404, 'User not found');
	}

	// 獲取用戶活動記錄
	const activities = await db.getUserActivities(userId, { limit: 50 });

	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role,
			lastLogin: user.lastLogin
		},
		activities
	};
}
````

---

## 🎨 實際應用範例

### 1. 部落格文章頁面

#### Load 函數

````javascript
import { error } from '@sveltejs/kit';
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const post = await db.getPost(params.slug);
	
	if (!post) {
		error(404, 'Post not found');
	}

	// 並行載入相關資料
	const [relatedPosts, comments] = await Promise.all([
		db.getRelatedPosts(post.id, 5),
		db.getPostComments(post.id)
	]);
	
	return {
		post: {
			title: post.title,
			content: post.content,
			publishedAt: post.publishedAt,
			author: post.author,
			tags: post.tags
		},
		relatedPosts,
		comments: comments.map(comment => ({
			id: comment.id,
			content: comment.content,
			author: comment.author,
			createdAt: comment.createdAt
		}))
	};
}
````

#### 頁面組件

````svelte
<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let formattedDate = $derived(
		new Date(data.post.publishedAt).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<svelte:head>
	<title>{data.post.title}</title>
	<meta name="description" content={data.post.content.substring(0, 160)} />
</svelte:head>

<article>
	<header>
		<h1>{data.post.title}</h1>
		<div class="meta">
			<span>By {data.post.author}</span>
			<time datetime={data.post.publishedAt}>{formattedDate}</time>
		</div>
		<div class="tags">
			{#each data.post.tags as tag}
				<span class="tag">{tag}</span>
			{/each}
		</div>
	</header>
	
	<div class="content">
		{@html data.post.content}
	</div>
</article>

<!-- 評論區 -->
<section class="comments">
	<h2>評論 ({data.comments.length})</h2>
	{#each data.comments as comment}
		<div class="comment">
			<strong>{comment.author}</strong>
			<time>{new Date(comment.createdAt).toLocaleDateString()}</time>
			<p>{comment.content}</p>
		</div>
	{/each}
</section>

<!-- 相關文章 -->
{#if data.relatedPosts.length > 0}
	<aside class="related">
		<h2>相關文章</h2>
		<ul>
			{#each data.relatedPosts as post}
				<li>
					<a href="/blog/{post.slug}">{post.title}</a>
				</li>
			{/each}
		</ul>
	</aside>
{/if}

<style>
	.meta {
		display: flex;
		gap: 1rem;
		color: #666;
		margin-bottom: 1rem;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.tag {
		background: #f0f0f0;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	.comment {
		border-left: 3px solid #ccc;
		padding-left: 1rem;
		margin-bottom: 1rem;
	}
</style>
````

### 2. 使用者個人資料頁面

#### Load 函數

````javascript
import { error, redirect } from '@sveltejs/kit';
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	// 檢查身份驗證
	if (!locals.user) {
		redirect(302, '/login');
	}

	const userId = params.userId;
	const user = await db.getUser(userId);
	
	if (!user) {
		error(404, 'User not found');
	}

	// 檢查權限
	const isOwnProfile = locals.user.id === userId;
	const canViewProfile = isOwnProfile || user.isPublic;
	
	if (!canViewProfile) {
		error(403, 'This profile is private');
	}

	// 並行載入資料
	const [posts, followers, following] = await Promise.all([
		db.getUserPosts(userId, { limit: 20 }),
		isOwnProfile ? db.getUserFollowers(userId) : [],
		isOwnProfile ? db.getUserFollowing(userId) : []
	]);

	return {
		profile: {
			id: user.id,
			username: user.username,
			bio: user.bio,
			avatar: user.avatar,
			joinedAt: user.createdAt,
			isPublic: user.isPublic
		},
		posts,
		stats: {
			followers: followers.length,
			following: following.length,
			posts: posts.length
		},
		isOwnProfile,
		followers: isOwnProfile ? followers : [],
		following: isOwnProfile ? following : []
	};
}
````

#### 頁面組件

````svelte
<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let joinedDate = $derived(
		new Date(data.profile.joinedAt).toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'long'
		})
	);
</script>

<svelte:head>
	<title>{data.profile.username} - Profile</title>
</svelte:head>

<div class="profile">
	<header class="profile-header">
		<img 
			src={data.profile.avatar || '/default-avatar.png'} 
			alt="{data.profile.username}'s avatar"
			class="avatar"
		/>
		<div class="info">
			<h1>{data.profile.username}</h1>
			<p class="bio">{data.profile.bio || 'No bio yet'}</p>
			<p class="joined">Joined {joinedDate}</p>
		</div>
		
		{#if data.isOwnProfile}
			<a href="/settings/profile" class="edit-btn">Edit Profile</a>
		{/if}
	</header>

	<div class="stats">
		<div class="stat">
			<strong>{data.stats.posts}</strong>
			<span>Posts</span>
		</div>
		<div class="stat">
			<strong>{data.stats.followers}</strong>
			<span>Followers</span>
		</div>
		<div class="stat">
			<strong>{data.stats.following}</strong>
			<span>Following</span>
		</div>
	</div>

	<section class="posts">
		<h2>Recent Posts</h2>
		{#if data.posts.length > 0}
			<div class="posts-grid">
				{#each data.posts as post}
					<article class="post-card">
						<h3>
							<a href="/blog/{post.slug}">{post.title}</a>
						</h3>
						<p>{post.excerpt}</p>
						<time>{new Date(post.publishedAt).toLocaleDateString()}</time>
					</article>
				{/each}
			</div>
		{:else}
			<p>No posts yet</p>
		{/if}
	</section>
</div>

<style>
	.profile-header {
		display: flex;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		object-fit: cover;
	}

	.info {
		flex: 1;
	}

	.bio {
		color: #666;
		margin: 0.5rem 0;
	}

	.joined {
		color: #999;
		font-size: 0.875rem;
	}

	.stats {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 1rem 0;
		border-top: 1px solid #eee;
		border-bottom: 1px solid #eee;
	}

	.stat {
		text-align: center;
	}

	.stat strong {
		display: block;
		font-size: 1.5rem;
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.post-card {
		border: 1px solid #eee;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
</style>
````

### 3. 產品列表頁面（帶篩選和分頁）

#### Load 函數

````javascript
/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch }) {
	const searchParams = url.searchParams;
	
	const filters = {
		page: parseInt(searchParams.get('page') || '1'),
		category: searchParams.get('category') || '',
		sort: searchParams.get('sort') || 'name',
		search: searchParams.get('search') || '',
		minPrice: parseFloat(searchParams.get('minPrice') || '0'),
		maxPrice: parseFloat(searchParams.get('maxPrice') || '0') || null
	};

	const queryString = new URLSearchParams(
		Object.entries(filters).filter(([_, value]) => value !== '' && value !== 0 && value !== null)
	).toString();
	
	const response = await fetch(`/api/products?${queryString}`);
	
	if (!response.ok) {
		error(response.status, 'Failed to load products');
	}

	const data = await response.json();
	
	return {
		products: data.products,
		pagination: {
			currentPage: filters.page,
			totalPages: data.totalPages,
			totalItems: data.totalItems,
			itemsPerPage: data.itemsPerPage
		},
		filters: {
			categories: data.categories,
			priceRange: data.priceRange,
			current: filters
		}
	};
}
````

#### 頁面組件

````svelte
<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	function updateFilter(key, value) {
		const url = new URL($page.url);
		
		if (value && value !== '0') {
			url.searchParams.set(key, value.toString());
		} else {
			url.searchParams.delete(key);
		}
		
		// 重置到第一頁
		url.searchParams.delete('page');
		
		goto(url, { replaceState: true });
	}

	function goToPage(pageNumber) {
		const url = new URL($page.url);
		url.searchParams.set('page', pageNumber.toString());
		goto(url);
	}

	function clearFilters() {
		goto('/products');
	}
</script>

<svelte:head>
	<title>Products - Our Store</title>
</svelte:head>

<div class="products-page">
	<h1>Products</h1>

	<!-- 篩選器 -->
	<div class="filters">
		<div class="filter-group">
			<label for="search">Search:</label>
			<input 
				id="search"
				type="search" 
				placeholder="Search products..."
				value={data.filters.current.search}
				oninput={(e) => updateFilter('search', e.target.value)}
			/>
		</div>

		<div class="filter-group">
			<label for="category">Category:</label>
			<select 
				id="category"
				value={data.filters.current.category} 
				onchange={(e) => updateFilter('category', e.target.value)}
			>
				<option value="">All Categories</option>
				{#each data.filters.categories as category}
					<option value={category.slug}>{category.name}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="sort">Sort by:</label>
			<select 
				id="sort"
				value={data.filters.current.sort} 
				onchange={(e) => updateFilter('sort', e.target.value)}
			>
				<option value="name">Name</option>
				<option value="price-low">Price: Low to High</option>
				<option value="price-high">Price: High to Low</option>
				<option value="newest">Newest</option>
			</select>
		</div>

		<div class="filter-group">
			<label>Price Range:</label>
			<div class="price-range">
				<input 
					type="number" 
					placeholder="Min"
					value={data.filters.current.minPrice || ''}
					oninput={(e) => updateFilter('minPrice', e.target.value)}
				/>
				<span>to</span>
				<input 
					type="number" 
					placeholder="Max"
					value={data.filters.current.maxPrice || ''}
					oninput={(e) => updateFilter('maxPrice', e.target.value)}
				/>
			</div>
		</div>

		<button onclick={clearFilters} class="clear-filters">
			Clear Filters
		</button>
	</div>

	<!-- 結果統計 -->
	<div class="results-info">
		<p>
			Showing {data.products.length} of {data.pagination.totalItems} products
			{#if data.pagination.totalPages > 1}
				(Page {data.pagination.currentPage} of {data.pagination.totalPages})
			{/if}
		</p>
	</div>

	<!-- 產品列表 -->
	<div class="products-grid">
		{#each data.products as product}
			<div class="product-card">
				<img 
					src={product.image || '/placeholder.jpg'} 
					alt={product.name}
					loading="lazy"
				/>
				<div class="product-info">
					<h3>
						<a href="/products/{product.slug}">{product.name}</a>
					</h3>
					<p class="description">{product.description}</p>
					<div class="price-stock">
						<span class="price">${product.price}</span>
						<span class="stock" class:out-of-stock={product.stock === 0}>
							{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- 分頁 -->
	{#if data.pagination.totalPages > 1}
		<div class="pagination">
			{#if data.pagination.currentPage > 1}
				<button onclick={() => goToPage(data.pagination.currentPage - 1)}>
					Previous
				</button>
			{/if}

			{#each Array(data.pagination.totalPages) as _, i}
				{@const pageNum = i + 1}
				<button 
					onclick={() => goToPage(pageNum)}
					class:active={data.pagination.currentPage === pageNum}
				>
					{pageNum}
				</button>
			{/each}

			{#if data.pagination.currentPage < data.pagination.totalPages}
				<button onclick={() => goToPage(data.pagination.currentPage + 1)}>
					Next
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #f9f9f9;
		border-radius: 0.5rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.price-range {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.price-range input {
		width: 80px;
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.product-card {
		border: 1px solid #ddd;
		border-radius: 0.5rem;
		overflow: hidden;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.product-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.product-card img {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	.product-info {
		padding: 1rem;
	}

	.price-stock {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}

	.price {
		font-size: 1.25rem;
		font-weight: bold;
		color: #2563eb;
	}

	.stock.out-of-stock {
		color: #dc2626;
	}

	.pagination {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.pagination button {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		background: white;
		cursor: pointer;
	}

	.pagination button.active {
		background: #2563eb;
		color: white;
		border-color: #2563eb;
	}
</style>
````

---

## 🔍 重要概念

### 1. 型別安全

SvelteKit 自動生成型別定義：

````typescript
// $types.d.ts (自動生成)
export type PageData = {
	post: {
		title: string;
		content: string;
		publishedAt: string;
		author: string;
	};
	relatedPosts: Array<{
		slug: string;
		title: string;
	}>;
};
````

### 2. 序列化限制 (Server Load)

````javascript
// ✅ 可序列化
return {
	user: { name: 'John', age: 30 },
	date: new Date(),
	regex: /pattern/,
	map: new Map([['key', 'value']]),
	bigint: BigInt(123)
};

// ❌ 不可序列化
return {
	domNode: document.getElementById('app'),
	function: () => {},
	symbol: Symbol('test'),
	class: new MyClass()
};
````

### 3. 效能最佳化

````javascript
// ✅ 並行載入（推薦）
const [user, posts, comments] = await Promise.all([
	getUser(params.id),
	getUserPosts(params.id),
	getUserComments(params.id)
]);

// ❌ 序列載入（較慢）
const user = await getUser(params.id);
const posts = await getUserPosts(params.id);
const comments = await getUserComments(params.id);
````

Page Data 是建構高效能 SvelteKit 應用程式的基礎，掌握這個概念可以讓您建立出快速、型別安全且用戶體驗優秀的應用程式！

找到 2 種授權類型的類似代碼
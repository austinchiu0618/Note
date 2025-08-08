## Optional parameters 可選參數

### 核心概念

**問題場景**：有時我們希望某個路由參數是可選的

````
// 必需參數 - 兩個不同的 URL 需要兩個不同的路由
/home        ← 需要一個路由
/en/home     ← 需要另一個路由
/zh/home     ← 需要第三個路由
````

**解決方案**：使用可選參數，一個路由處理多種情況

````
// 可選參數 - 一個路由處理所有情況
[[lang]]/home  ← 同時匹配 /home, /en/home, /zh/home
````

### 1. 基本語法

#### 雙括號語法
**語法**：`[[paramName]]`

````
src/routes/[[lang]]/home/+page.svelte
````

**匹配的 URL**：
- home - `lang` 參數為 `undefined`
- `/en/home` - `lang` 參數為 `"en"`
- `/zh/home` - `lang` 參數為 `"zh"`

### 2. 基礎範例：多語言支援

#### 路由結構
````
src/routes/
├ [[lang]]/
│ ├ +layout.svelte
│ ├ +page.svelte          ← 首頁
│ ├ about/
│ │ └ +page.svelte        ← 關於頁面
│ └ products/
│   ├ +page.svelte        ← 產品列表
│   └ [id]/
│     └ +page.svelte      ← 產品詳情
└ +layout.svelte
````

#### Load 函數處理可選參數

````javascript
/** @type {import('./$types').LayoutLoad} */
export async function load({ params, fetch }) {
    const { lang } = params;
    
    // 預設語言處理
    const defaultLang = 'zh';
    const currentLang = lang || defaultLang;
    
    // 支援的語言列表
    const supportedLangs = ['zh', 'en', 'ja', 'ko'];
    
    // 驗證語言是否支援
    if (lang && !supportedLangs.includes(lang)) {
        // 如果提供了不支援的語言，可以重導向或拋出錯誤
        throw redirect(302, '/');
    }
    
    // 載入語言包
    const translations = await loadTranslations(currentLang);
    
    return {
        lang: currentLang,
        isDefaultLang: currentLang === defaultLang,
        supportedLangs,
        translations
    };
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`/api/translations/${lang}.json`);
        return await response.json();
    } catch (error) {
        console.warn(`Failed to load translations for ${lang}, falling back to default`);
        const fallbackResponse = await fetch('/api/translations/zh.json');
        return await fallbackResponse.json();
    }
}
````

#### 佈局組件

````svelte
<script>
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    
    /** @type {import('./$types').LayoutData} */
    let { data, children } = $props();
    
    // 語言切換功能
    function switchLanguage(newLang) {
        const currentPath = page.url.pathname;
        
        // 移除當前語言前綴（如果存在）
        const pathWithoutLang = data.isDefaultLang 
            ? currentPath 
            : currentPath.replace(`/${data.lang}`, '');
        
        // 構建新的路徑
        const newPath = newLang === 'zh' 
            ? pathWithoutLang 
            : `/${newLang}${pathWithoutLang}`;
            
        goto(newPath);
    }
</script>

<svelte:head>
    <html lang={data.lang}>
    <title>{data.translations.site.title}</title>
</svelte:head>

<div class="app">
    <!-- 語言切換器 -->
    <header class="header">
        <nav class="main-nav">
            <a href={data.isDefaultLang ? '/' : `/${data.lang}`}>
                {data.translations.nav.home}
            </a>
            <a href={data.isDefaultLang ? '/about' : `/${data.lang}/about`}>
                {data.translations.nav.about}
            </a>
            <a href={data.isDefaultLang ? '/products' : `/${data.lang}/products`}>
                {data.translations.nav.products}
            </a>
        </nav>
        
        <div class="language-switcher">
            {#each data.supportedLangs as lang}
                <button 
                    class:active={lang === data.lang}
                    onclick={() => switchLanguage(lang)}
                >
                    {lang.toUpperCase()}
                </button>
            {/each}
        </div>
    </header>
    
    <!-- 主要內容 -->
    <main>
        {@render children()}
    </main>
</div>

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
    }
    
    .main-nav a {
        margin-right: 1rem;
        text-decoration: none;
        color: #495057;
    }
    
    .language-switcher button {
        margin-left: 0.5rem;
        padding: 0.25rem 0.5rem;
        border: 1px solid #ced4da;
        background: white;
        cursor: pointer;
    }
    
    .language-switcher button.active {
        background: #007bff;
        color: white;
    }
</style>
````

#### 頁面組件

````svelte
<script>
    /** @type {import('./$types').PageData} */
    let { data } = $props();
    
    // 從父佈局繼承語言數據
    $: ({ translations, lang } = data);
</script>

<svelte:head>
    <title>{translations.pages.about.title} - {translations.site.title}</title>
    <meta name="description" content={translations.pages.about.description}>
</svelte:head>

<div class="about-page">
    <h1>{translations.pages.about.title}</h1>
    <p>{translations.pages.about.content}</p>
    
    <div class="info">
        <p>當前語言：{lang}</p>
        <p>頁面路徑：{$page.url.pathname}</p>
    </div>
</div>
````

### 3. 進階範例：版本化 API

#### 可選版本參數

````
src/routes/api/[[version]]/users/+server.js
````

**匹配的 URL**：
- `/api/users` - 預設版本
- `/api/v1/users` - 版本 1
- `/api/v2/users` - 版本 2

````javascript
import { json, error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
    const { version } = params;
    
    // 版本處理
    const apiVersion = getApiVersion(version);
    
    // 驗證版本
    if (!isValidVersion(apiVersion)) {
        throw error(400, `不支援的 API 版本: ${version}`);
    }
    
    // 根據版本返回不同的資料格式
    const users = await getUsersData();
    const formattedUsers = formatUsersForVersion(users, apiVersion);
    
    return json({
        version: apiVersion,
        data: formattedUsers,
        meta: {
            total: users.length,
            timestamp: new Date().toISOString()
        }
    });
}

function getApiVersion(version) {
    if (!version) return 'v1'; // 預設版本
    
    // 處理不同的版本格式
    if (version.startsWith('v')) return version;
    return `v${version}`;
}

function isValidVersion(version) {
    return ['v1', 'v2', 'v3'].includes(version);
}

function formatUsersForVersion(users, version) {
    switch (version) {
        case 'v1':
            return users.map(user => ({
                id: user.id,
                name: user.name
            }));
            
        case 'v2':
            return users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.createdAt
            }));
            
        case 'v3':
            return users.map(user => ({
                id: user.id,
                profile: {
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                },
                metadata: {
                    created_at: user.createdAt,
                    updated_at: user.updatedAt,
                    last_login: user.lastLogin
                }
            }));
            
        default:
            return users;
    }
}
````

### 4. 可選參數與匹配器結合

#### 帶驗證的可選參數

````javascript
/**
 * 語言參數匹配器
 * @param {string} param
 * @return {param is ('en' | 'zh' | 'ja' | 'ko')}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    return ['en', 'zh', 'ja', 'ko'].includes(param);
}
````

#### 使用匹配器的可選參數

````
src/routes/[[lang=lang]]/shop/+page.svelte
````

````javascript
/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
    const { lang } = params;
    
    // 因為使用了匹配器，lang 如果存在就一定是有效的語言代碼
    const currentLang = lang || 'zh';
    
    const products = await fetchProducts(currentLang);
    
    return {
        products,
        lang: currentLang
    };
}
````

### 5. 複雜應用：多層可選參數

#### 嵌套可選參數

````
src/routes/[[lang]]/blog/[[category]]/+page.svelte
````

**匹配的 URL**：
- `/blog` - 所有語言，所有分類
- `/en/blog` - 英文，所有分類
- `/blog/tech` - 所有語言，科技分類
- `/en/blog/tech` - 英文，科技分類

````javascript
/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
    const { lang, category } = params;
    
    // 預設值處理
    const currentLang = lang || 'zh';
    const currentCategory = category || 'all';
    
    // URL 搜尋參數
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // 獲取文章
    const { posts, total } = await fetchPosts({
        lang: currentLang,
        category: currentCategory,
        page,
        limit
    });
    
    // 獲取分類列表
    const categories = await fetchCategories(currentLang);
    
    return {
        posts,
        categories,
        pagination: {
            current: page,
            total: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        },
        filters: {
            lang: currentLang,
            category: currentCategory
        }
    };
}
````

### 6. 重要限制與注意事項

#### 不能跟在剩餘參數後面

````
// ❌ 錯誤：不會工作
src/routes/[...rest]/[[optional]]/+page.svelte

// ✅ 正確：可選參數在前面
src/routes/[[optional]]/[...rest]/+page.svelte
````

**原因**：剩餘參數是"貪婪"的，會匹配所有後續的路徑段

#### 參數驗證最佳實踐

````javascript
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutLoad} */
export async function load({ params, url }) {
    const { lang } = params;
    
    if (lang) {
        // 驗證語言參數
        const supportedLangs = ['en', 'zh', 'ja', 'ko'];
        
        if (!supportedLangs.includes(lang)) {
            // 重導向到預設語言版本
            const newPath = url.pathname.replace(`/${lang}`, '');
            throw redirect(302, newPath || '/');
        }
    }
    
    return {
        lang: lang || 'zh'
    };
}
````

### 7. SEO 與多語言優化

#### 正確的 SEO 標籤

````svelte
<script>
    import { page } from '$app/state';
    
    /** @type {import('./$types').LayoutData} */
    let { data, children } = $props();
    
    $: currentUrl = page.url.href;
    $: canonicalUrl = getCanonicalUrl(currentUrl, data.lang);
    $: alternateUrls = getAlternateUrls(currentUrl, data.supportedLangs, data.lang);
</script>

<svelte:head>
    <html lang={data.lang}>
    
    <!-- 標準 SEO 標籤 -->
    <link rel="canonical" href={canonicalUrl}>
    
    <!-- 多語言替代頁面 -->
    {#each alternateUrls as { lang, url }}
        <link rel="alternate" hreflang={lang} href={url}>
    {/each}
    
    <!-- 預設語言 -->
    <link rel="alternate" hreflang="x-default" href={getDefaultLangUrl(currentUrl)}>
</svelte:head>

{@render children()}
````

### 最佳實踐總結

1. **預設值處理**：總是為可選參數提供合理的預設值
2. **驗證參數**：結合匹配器或在 load 函數中驗證參數有效性
3. **SEO 優化**：正確設置多語言 SEO 標籤
4. **URL 一致性**：確保 URL 生成邏輯的一致性
5. **錯誤處理**：妥善處理無效參數的情況
6. **性能考慮**：避免在可選參數變化時重複載入相同數據

可選參數是 SvelteKit 路由系統的強大功能，特別適合多語言網站、版本化 API 和靈活的內容分類系統。
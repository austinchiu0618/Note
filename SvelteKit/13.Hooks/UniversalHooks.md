## 通用 Hook 完整教學

### 核心概念

**通用 Hook** 是在 `src/hooks.js` 中定義的函數，它們的特點：
- **同時在服務端和客戶端執行**
- 與"共享 Hook"不同：共享 Hook 是環境特定的，通用 Hook 是真正的跨環境
- 主要用於 URL 路由重寫和數據序列化

### 主要的通用 Hook 函數

#### 1. `reroute` - URL 路由重寫

**執行時機**：在 `handle` Hook 之前執行
**作用**：改變 URL 如何轉換為路由，不影響瀏覽器地址欄

##### 多語言路由映射範例

````javascript
/** @type {Record<string, string>} */
const routes = {
    // 德語本地化路由
    '/de/ueber-uns': '/de/about',
    '/de/kontakt': '/de/contact', 
    '/de/produkte': '/de/products',
    '/de/hilfe': '/de/help',
    
    // 法語本地化路由
    '/fr/a-propos': '/fr/about',
    '/fr/contact': '/fr/contact',
    '/fr/produits': '/fr/products',
    '/fr/aide': '/fr/help',
    
    // 日語本地化路由
    '/ja/私たちについて': '/ja/about',
    '/ja/お問い合わせ': '/ja/contact',
    '/ja/製品': '/ja/products',
    '/ja/ヘルプ': '/ja/help',
    
    // 舊版路由重導向
    '/legacy/old-page': '/new-page',
    '/v1/api': '/api/v2',
    '/blog/post': '/articles'
};

/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
    const pathname = url.pathname;
    
    // 直接映射查找
    if (routes[pathname]) {
        console.log(`路由重寫: ${pathname} → ${routes[pathname]}`);
        return routes[pathname];
    }
    
    // 動態路由處理：產品頁面
    const productMatch = pathname.match(/^\/([a-z]{2})\/produkt\/(.+)$/);
    if (productMatch) {
        const [, lang, productSlug] = productMatch;
        return `/${lang}/product/${productSlug}`;
    }
    
    // 動態路由處理：類別頁面
    const categoryMatch = pathname.match(/^\/([a-z]{2})\/kategorie\/(.+)$/);
    if (categoryMatch) {
        const [, lang, categorySlug] = categoryMatch;
        return `/${lang}/category/${categorySlug}`;
    }
    
    // 沒有匹配則保持原路徑
    return pathname;
}
````

##### 更複雜的路由重寫

````javascript
/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
    const { pathname, search } = url;
    
    // 1. 移除尾隨斜線（除了根路徑）
    if (pathname.length > 1 && pathname.endsWith('/')) {
        return pathname.slice(0, -1);
    }
    
    // 2. 處理舊版 API 路徑
    if (pathname.startsWith('/api/v1/')) {
        return pathname.replace('/api/v1/', '/api/v2/');
    }
    
    // 3. 將查詢參數轉換為路徑參數
    // /search?q=keyword → /search/keyword
    if (pathname === '/search' && search) {
        const params = new URLSearchParams(search);
        const query = params.get('q');
        const category = params.get('category');
        
        if (query) {
            let newPath = `/search/${encodeURIComponent(query)}`;
            if (category) {
                newPath += `/${encodeURIComponent(category)}`;
            }
            return newPath;
        }
    }
    
    // 4. 短網址展開
    const shortUrlMatch = pathname.match(/^\/s\/([a-zA-Z0-9]+)$/);
    if (shortUrlMatch) {
        const shortCode = shortUrlMatch[1];
        // 這裡您需要實現短網址到實際路徑的映射
        const expandedPath = expandShortUrl(shortCode);
        if (expandedPath) {
            return expandedPath;
        }
    }
    
    // 5. 處理移動端路徑
    if (pathname.startsWith('/m/')) {
        return pathname.replace('/m/', '/mobile/');
    }
    
    return pathname;
}

// 短網址映射（實際實現中可能從資料庫查詢）
const shortUrls = {
    'abc123': '/products/awesome-widget',
    'def456': '/articles/how-to-guide',
    'ghi789': '/about/team'
};

function expandShortUrl(code) {
    return shortUrls[code] || null;
}
````

#### 2. `transport` - 自定義數據傳輸

**作用**：允許跨服務端/客戶端邊界傳遞自定義類型
**原理**：序列化/反序列化非原始類型的數據

##### 基礎範例：Vector 類型

````javascript
export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const mag = this.magnitude();
        return new Vector(this.x / mag, this.y / mag);
    }
    
    toString() {
        return `Vector(${this.x}, ${this.y})`;
    }
}
````

````javascript
import { Vector } from '$lib/math.js';

/** @type {import('@sveltejs/kit').Transport} */
export const transport = {
    Vector: {
        // 編碼：將 Vector 實例轉換為可序列化的格式
        encode: (value) => {
            if (value instanceof Vector) {
                return [value.x, value.y];
            }
            return false; // 不是 Vector 類型，不處理
        },
        
        // 解碼：將序列化數據重建為 Vector 實例
        decode: ([x, y]) => new Vector(x, y)
    }
};
````

##### 複雜範例：多種自定義類型

````javascript
export class User {
    constructor(id, name, email, createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
    }
    
    getDisplayName() {
        return this.name || this.email;
    }
}

export class Product {
    constructor(id, name, price, currency = 'USD') {
        this.id = id;
        this.name = name;
        this.price = price;
        this.currency = currency;
    }
    
    getFormattedPrice() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currency
        }).format(this.price);
    }
}

export class DateRange {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    
    getDays() {
        return Math.ceil((this.end - this.start) / (1000 * 60 * 60 * 24));
    }
    
    contains(date) {
        return date >= this.start && date <= this.end;
    }
}
````

````javascript
import { User, Product, DateRange } from '$lib/types.js';

/** @type {import('@sveltejs/kit').Transport} */
export const transport = {
    // 處理 Date 對象
    Date: {
        encode: (value) => value instanceof Date && value.toISOString(),
        decode: (isoString) => new Date(isoString)
    },
    
    // 處理 User 對象
    User: {
        encode: (value) => {
            if (value instanceof User) {
                return {
                    id: value.id,
                    name: value.name,
                    email: value.email,
                    createdAt: value.createdAt.toISOString()
                };
            }
            return false;
        },
        decode: (data) => new User(
            data.id,
            data.name, 
            data.email,
            new Date(data.createdAt)
        )
    },
    
    // 處理 Product 對象
    Product: {
        encode: (value) => {
            if (value instanceof Product) {
                return {
                    id: value.id,
                    name: value.name,
                    price: value.price,
                    currency: value.currency
                };
            }
            return false;
        },
        decode: (data) => new Product(
            data.id,
            data.name,
            data.price,
            data.currency
        )
    },
    
    // 處理 DateRange 對象
    DateRange: {
        encode: (value) => {
            if (value instanceof DateRange) {
                return {
                    start: value.start.toISOString(),
                    end: value.end.toISOString()
                };
            }
            return false;
        },
        decode: (data) => new DateRange(
            new Date(data.start),
            new Date(data.end)
        )
    },
    
    // 處理 Map 對象
    Map: {
        encode: (value) => {
            if (value instanceof Map) {
                return Array.from(value.entries());
            }
            return false;
        },
        decode: (entries) => new Map(entries)
    },
    
    // 處理 Set 對象
    Set: {
        encode: (value) => {
            if (value instanceof Set) {
                return Array.from(value);
            }
            return false;
        },
        decode: (array) => new Set(array)
    },
    
    // 處理 BigInt
    BigInt: {
        encode: (value) => typeof value === 'bigint' && value.toString(),
        decode: (str) => BigInt(str)
    }
};
````

##### 在 Load 函數中使用

````javascript
import { Product, DateRange } from '$lib/types.js';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    const response = await fetch('/api/products');
    const data = await response.json();
    
    // 返回自定義類型，transport 會自動處理序列化
    return {
        products: data.products.map(p => new Product(p.id, p.name, p.price, p.currency)),
        promotionPeriod: new DateRange(
            new Date(data.promotion.start),
            new Date(data.promotion.end)
        ),
        categories: new Set(data.categories),
        metadata: new Map(Object.entries(data.metadata))
    };
}
````

````svelte
<script>
    /** @type {import('./$types').PageData} */
    let { data } = $props();
    
    // 這些會自動反序列化為正確的類型
    $: ({ products, promotionPeriod, categories, metadata } = data);
</script>

<h1>產品列表</h1>

<div class="promotion-info">
    <p>促銷活動期間：{promotionPeriod.getDays()} 天</p>
    <p>是否在促銷期間：{promotionPeriod.contains(new Date()) ? '是' : '否'}</p>
</div>

<div class="products">
    {#each products as product}
        <div class="product-card">
            <h2>{product.name}</h2>
            <p class="price">{product.getFormattedPrice()}</p>
        </div>
    {/each}
</div>

<div class="categories">
    <h3>分類：</h3>
    {#each Array.from(categories) as category}
        <span class="category-tag">{category}</span>
    {/each}
</div>

<div class="metadata">
    <h3>元數據：</h3>
    {#each Array.from(metadata.entries()) as [key, value]}
        <p><strong>{key}:</strong> {value}</p>
    {/each}
</div>
````

### 完整應用範例

#### 結合 reroute 和 transport

````javascript
import { User, Product, LocalizedString } from '$lib/types.js';

// 語言路由映射
const localizedRoutes = {
    de: {
        '/produkte': '/products',
        '/ueber-uns': '/about',
        '/kontakt': '/contact'
    },
    fr: {
        '/produits': '/products', 
        '/a-propos': '/about',
        '/contact': '/contact'
    },
    ja: {
        '/製品': '/products',
        '/私たちについて': '/about',
        '/お問い合わせ': '/contact'
    }
};

/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
    const pathname = url.pathname;
    
    // 提取語言代碼
    const langMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
    if (!langMatch) return pathname;
    
    const [, lang, path = '/'] = langMatch;
    const routes = localizedRoutes[lang];
    
    if (routes && routes[path]) {
        return `/${lang}${routes[path]}`;
    }
    
    return pathname;
}

/** @type {import('@sveltejs/kit').Transport} */
export const transport = {
    Date: {
        encode: (value) => value instanceof Date && value.toISOString(),
        decode: (str) => new Date(str)
    },
    
    User: {
        encode: (value) => {
            if (value instanceof User) {
                return {
                    id: value.id,
                    name: value.name,
                    email: value.email,
                    preferences: value.preferences,
                    createdAt: value.createdAt.toISOString()
                };
            }
            return false;
        },
        decode: (data) => new User(
            data.id,
            data.name,
            data.email,
            data.preferences,
            new Date(data.createdAt)
        )
    },
    
    Product: {
        encode: (value) => {
            if (value instanceof Product) {
                return {
                    id: value.id,
                    name: value.name,
                    description: value.description,
                    price: value.price,
                    currency: value.currency,
                    images: value.images,
                    categories: Array.from(value.categories)
                };
            }
            return false;
        },
        decode: (data) => new Product(
            data.id,
            data.name,
            data.description,
            data.price,
            data.currency,
            data.images,
            new Set(data.categories)
        )
    },
    
    LocalizedString: {
        encode: (value) => {
            if (value instanceof LocalizedString) {
                return value.translations;
            }
            return false;
        },
        decode: (translations) => new LocalizedString(translations)
    }
};
````

### 最佳實踐建議

1. **reroute 性能**：
   - 避免複雜的正則表達式
   - 使用預編譯的映射表
   - 考慮快取重寫結果

2. **transport 安全性**：
   - 驗證反序列化的數據
   - 避免執行任意代碼
   - 處理循環引用

3. **調試和監控**：
````javascript
/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
    const originalPath = url.pathname;
    const newPath = performReroute(url);
    
    if (originalPath !== newPath) {
        console.log(`路由重寫: ${originalPath} → ${newPath}`);
    }
    
    return newPath;
}
````

4. **錯誤處理**：
````javascript
/** @type {import('@sveltejs/kit').Transport} */
export const transport = {
    CustomType: {
        encode: (value) => {
            try {
                if (value instanceof CustomType) {
                    return value.serialize();
                }
                return false;
            } catch (error) {
                console.error('序列化錯誤:', error);
                return false;
            }
        },
        decode: (data) => {
            try {
                return CustomType.deserialize(data);
            } catch (error) {
                console.error('反序列化錯誤:', error);
                throw error;
            }
        }
    }
};
````

**通用 Hook** 提供了強大的 URL 重寫和數據傳輸能力，是構建多語言應用和複雜數據結構傳輸的關鍵工具。
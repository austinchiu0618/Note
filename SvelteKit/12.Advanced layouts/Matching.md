## Matching 參數匹配器

SvelteKit 的參數匹配器 (Matcher) 系統。這是一個強大的功能，用於驗證和限制路由參數的格式

### 核心問題

**場景**：動態路由過於寬泛，需要限制參數格式

````
// 問題：這個路由會匹配任何字符串
src/routes/fruits/[page]/+page.svelte

// ✅ 匹配：/fruits/apple
// ❌ 也匹配：/fruits/rocketship  ← 不是我們想要的
````

**解決方案**：使用參數匹配器來驗證參數值

### 1. 基礎匹配器

#### 創建匹配器

````javascript
/**
 * @param {string} param - 路由參數值
 * @return {param is ('apple' | 'orange' | 'banana')} - TypeScript 類型守衞
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    return ['apple', 'orange', 'banana'].includes(param);
}
````

#### 使用匹配器

````
// 路由檔案：注意 [page=fruit] 語法
src/routes/fruits/[page=fruit]/+page.svelte
````

#### 完整範例

````svelte
<script>
    import { page } from '$app/state';
    
    // TypeScript 現在知道 page.params.page 只能是 'apple' | 'orange' | 'banana'
    $: fruitName = page.params.page;
    
    const fruitInfo = {
        apple: { color: '紅色', taste: '甜脆', season: '秋季' },
        orange: { color: '橘色', taste: '酸甜', season: '冬季' },
        banana: { color: '黃色', taste: '香甜', season: '全年' }
    };
</script>

<h1>{fruitName.toUpperCase()}</h1>
<div class="fruit-card">
    <p><strong>顏色：</strong>{fruitInfo[fruitName].color}</p>
    <p><strong>口感：</strong>{fruitInfo[fruitName].taste}</p>
    <p><strong>季節：</strong>{fruitInfo[fruitName].season}</p>
</div>

<!-- 如果訪問 /fruits/watermelon，會得到 404 而不是渲染這個頁面 -->
````

### 2. 常用匹配器模式

#### 數字 ID 匹配器

````javascript
/**
 * 匹配正整數
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    return /^\d+$/.test(param);
}
````

#### UUID 匹配器

````javascript
/**
 * 匹配 UUID 格式
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(param);
}
````

#### 日期匹配器

````javascript
// filepath: src/params/date.js
/**
 * 匹配 YYYY-MM-DD 格式的日期
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(param)) return false;
    
    // 驗證是否為有效日期
    const date = new Date(param);
    return date instanceof Date && !isNaN(date) && param === date.toISOString().split('T')[0];
}
````

#### 語言代碼匹配器

````javascript
/**
 * 匹配支援的語言代碼
 * @param {string} param
 * @return {param is ('zh' | 'en' | 'ja' | 'ko')}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    return ['zh', 'en', 'ja', 'ko'].includes(param);
}
````

### 3. 複雜匹配器範例

#### 產品 SKU 匹配器

````javascript
/**
 * 匹配產品 SKU：格式 ABC-1234-XYZ
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    // SKU 格式：3個字母-4個數字-3個字母
    const skuPattern = /^[A-Z]{3}-\d{4}-[A-Z]{3}$/;
    
    if (!skuPattern.test(param)) return false;
    
    // 額外驗證：檢查前綴是否為有效的產品類別
    const prefix = param.split('-')[0];
    const validPrefixes = ['ELE', 'CLO', 'BOO', 'TOY']; // 電子、服裝、書籍、玩具
    
    return validPrefixes.includes(prefix);
}
````

#### 版本號匹配器

````javascript
/**
 * 匹配語義化版本號：v1.2.3 或 1.2.3
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    // 移除可選的 'v' 前綴
    const version = param.startsWith('v') ? param.slice(1) : param;
    
    // 語義化版本格式：major.minor.patch
    const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    
    return semverPattern.test(version);
}
````

### 4. 實際應用場景

#### 多語言博客系統

````
src/routes/
├ params/
│ ├ lang.js
│ ├ slug.js
│ └ date.js
├ [[lang=lang]]/
│ ├ blog/
│ │ ├ [date=date]/
│ │ │ └ [slug=slug]/
│ │ │   └ +page.svelte
│ │ └ +page.svelte
│ └ +layout.svelte
└ +layout.svelte
````

````javascript
/**
 * 匹配博客文章 slug：只允許字母、數字、連字符
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(param) && param.length >= 3 && param.length <= 100;
}
````

````svelte
<script>
    import { page } from '$app/state';
    
    /** @type {import('./$types').PageData} */
    let { data } = $props();
    
    // 所有參數都已經過驗證
    $: ({ lang = 'zh', date, slug } = page.params);
</script>

<article>
    <header>
        <h1>{data.post.title}</h1>
        <time datetime={date}>{date}</time>
        <p>語言：{lang}</p>
    </header>
    
    <div class="content">
        {@html data.post.content}
    </div>
</article>
````

#### API 路由保護

````javascript
/**
 * 匹配 API 版本：v1, v2, v3
 * @param {string} param
 * @return {param is ('v1' | 'v2' | 'v3')}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    return ['v1', 'v2', 'v3'].includes(param);
}

// filepath: src/params/resourceId.js
/**
 * 匹配資源 ID：數字或 UUID
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    // 數字 ID
    if (/^\d+$/.test(param)) return true;
    
    // UUID
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(param);
}
````

````javascript
/routes/api/[version=apiVersion]/users/[id=resourceId]/+server.js
import { json, error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    const { version, id } = params;
    
    // 參數已經過驗證，可以安全使用
    try {
        const user = await getUserById(id, version);
        
        if (!user) {
            throw error(404, '用户未找到');
        }
        
        return json({
            version,
            user: formatUserData(user, version)
        });
    } catch (err) {
        throw error(500, '內部伺服器錯誤');
    }
}

function formatUserData(user, version) {
    switch (version) {
        case 'v1':
            return { id: user.id, name: user.name };
        case 'v2':
            return { id: user.id, name: user.name, email: user.email };
        case 'v3':
            return user; // 完整資料
        default:
            return user;
    }
}
````

### 5. 匹配器測試

**SvelteKit 支援為匹配器編寫測試**：

````javascript
import { describe, test, expect } from 'vitest';
import { match } from './uuid.js';

describe('UUID matcher', () => {
    test('匹配有效的 UUID', () => {
        expect(match('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
        expect(match('A1B2C3D4-E5F6-7890-ABCD-EF1234567890')).toBe(true);
    });
    
    test('拒絕無效的 UUID', () => {
        expect(match('not-a-uuid')).toBe(false);
        expect(match('123e4567-e89b-12d3-a456')).toBe(false);
        expect(match('123e4567-e89b-12d3-a456-426614174000-extra')).toBe(false);
    });
    
    test('拒絕空字符串', () => {
        expect(match('')).toBe(false);
    });
});

// filepath: src/params/fruit.test.js
import { describe, test, expect } from 'vitest';
import { match } from './fruit.js';

describe('Fruit matcher', () => {
    test('匹配支援的水果', () => {
        expect(match('apple')).toBe(true);
        expect(match('orange')).toBe(true);
        expect(match('banana')).toBe(true);
    });
    
    test('拒絕不支援的水果', () => {
        expect(match('watermelon')).toBe(false);
        expect(match('grape')).toBe(false);
        expect(match('Apple')).toBe(false); // 區分大小寫
    });
});
````

### 6. 高級技巧

#### 動態匹配器

````javascript
/**
 * 可以根據環境或配置動態改變行為的匹配器
 * @param {string} param
 * @return {boolean}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
    // 開發環境允許更寬鬆的匹配
    if (import.meta.env.DEV) {
        return /^[a-zA-Z0-9-_]+$/.test(param);
    }
    
    // 生產環境更嚴格
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(param);
}
````

#### 組合匹配器

````javascript
export function createEnumMatcher(values) {
    return function match(param) {
        return values.includes(param);
    };
}

export function createRegexMatcher(pattern) {
    return function match(param) {
        return pattern.test(param);
    };
}

// filepath: src/params/category.js
import { createEnumMatcher } from '$lib/matchers.js';

export const match = createEnumMatcher(['electronics', 'clothing', 'books']);
````

### 關鍵要點總結

1. **位置**：匹配器檔案放在 `src/params/` 目錄
2. **命名**：檔案名對應匹配器名稱
3. **語法**：在路由中使用 `[param=matcher]` 格式
4. **執行環境**：匹配器在服務端和客户端都會執行
5. **優先級**：帶匹配器的參數比普通參數有更高的路由優先級
6. **類型安全**：配合 TypeScript 提供更好的類型推斷

參數匹配器是 SvelteKit 路由系統的強大功能，能夠確保您的應用只處理有效的參數值，提升應用的穩定性和安全性。
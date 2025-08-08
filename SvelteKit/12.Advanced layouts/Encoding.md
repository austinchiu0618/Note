## Encoding

如何在檔案名稱中使用特殊字符。

### 為什麼需要編碼？

**問題場景**：某些字符在檔案系統或 SvelteKit 中有特殊含義，無法直接用作路由名稱。

### 1. 受限制的字符

#### 檔案系統限制
- **Linux/Mac**：`/`
- **Windows**：`\ / : * ? " < > |`

#### URL 特殊字符
- `#` - 錨點標識符
- `%` - URL 編碼標識符

#### SvelteKit 特殊字符
- `[ ]` - 動態參數
- `( )` - 路由分組

### 2. 十六進制轉義序列

**語法格式**：`[x+nn]`，其中 `nn` 是十六進制字符代碼

#### 常用字符編碼對照表

````javascript
// 獲取字符的十六進制代碼
':'.charCodeAt(0).toString(16); // '3a'
'*'.charCodeAt(0).toString(16); // '2a'
'?'.charCodeAt(0).toString(16); // '3f'
````

**完整編碼對照**：
- `\` → `[x+5c]`
- `/` → `[x+2f]`
- `:` → `[x+3a]`
- `*` → `[x+2a]`
- `?` → `[x+3f]`
- `"` → `[x+22]`
- `<` → `[x+3c]`
- `>` → `[x+3e]`
- `|` → `[x+7c]`
- `#` → `[x+23]`
- `%` → `[x+25]`
- `[` → `[x+5b]`
- `]` → `[x+5d]`
- `(` → `[x+28]`
- `)` → `[x+29]`

### 3. 實際應用範例

#### 範例 1：笑臉路由
**目標 URL**：`/smileys/:-)`

````
src/routes/smileys/[x+3a]-[x+29]/
└ +page.svelte
````

````svelte
<script>
    import { page } from '$app/state';
</script>

<h1>笑臉頁面</h1>
<p>當前路徑：{page.url.pathname}</p>
<!-- 顯示：當前路徑：/smileys/:-) -->
````

#### 範例 2：檔案路徑模擬
**目標 URL**：`/files/folder/subfolder/file.txt`

````
src/routes/files/[...path]/
└ +page.svelte
````

但如果您需要表示實際的斜線字符（不是路徑分隔符）：

````
src/routes/files/[x+2f]windows[x+2f]path/
└ +page.svelte
````

**對應 URL**：`/files//windows/path`

#### 範例 3：查詢參數模擬
**目標 URL**：`/search/name=john&age=25`

````
src/routes/search/name[x+3d]john[x+26]age[x+3d]25/
└ +page.svelte
````

### 4. Unicode 轉義序列

**語法格式**：`[u+nnnn]`，支援 Unicode 字符

#### 表情符號路由範例

````
<!-- 方法一：直接使用 Unicode 字符 -->
src/routes/😀/
└ +page.svelte

<!-- 方法二：使用 Unicode 轉義 -->
src/routes/[u+1f600]/
└ +page.svelte
````

**複雜 Unicode 範例**：

````
<!-- 瘋臉表情符號：🤪 -->
src/routes/reactions/[u+1f92a]/
└ +page.svelte

<!-- 等同於 -->
src/routes/reactions/🤪/
└ +page.svelte
````

````svelte
<script>
    import { page } from '$app/state';
    
    $: emoji = page.params; // 獲取參數
</script>

<h1>反應頁面</h1>
<p>選擇的表情：🤪</p>
<p>URL：{page.url.pathname}</p>
````

### 5. 實用工具函數

建立編碼和解碼的輔助函數：

````javascript
/**
 * 將字符串編碼為 SvelteKit 路由格式
 * @param {string} str 
 * @returns {string}
 */
export function encodeRouteString(str) {
    const specialChars = {
        '\\': '[x+5c]',
        '/': '[x+2f]',
        ':': '[x+3a]',
        '*': '[x+2a]',
        '?': '[x+3f]',
        '"': '[x+22]',
        '<': '[x+3c]',
        '>': '[x+3e]',
        '|': '[x+7c]',
        '#': '[x+23]',
        '%': '[x+25]',
        '[': '[x+5b]',
        ']': '[x+5d]',
        '(': '[x+28]',
        ')': '[x+29]'
    };
    
    return str.replace(/[\\/:*?"<>|#%\[\]()]/g, char => specialChars[char]);
}

/**
 * 將編碼的路由字符串解碼回原始字符串
 * @param {string} encoded 
 * @returns {string}
 */
export function decodeRouteString(encoded) {
    return encoded.replace(/\[x\+([0-9a-f]{2})\]/gi, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

/**
 * 獲取字符的十六進制編碼
 * @param {string} char 
 * @returns {string}
 */
export function getCharHex(char) {
    return char.charCodeAt(0).toString(16).padStart(2, '0');
}

// 使用範例
console.log(encodeRouteString('hello:world')); // 'hello[x+3a]world'
console.log(decodeRouteString('hello[x+3a]world')); // 'hello:world'
console.log(getCharHex(':')); // '3a'
````

### 6. 實際應用場景

#### .well-known 路由
**RFC 標準路由**，通常以 `.` 開頭：

````
src/routes/[x+2e]well-known/security[x+2e]txt/
└ +page.svelte
````

**對應 URL**：`/.well-known/security.txt`

````svelte
<script>
    // 提供安全聯絡資訊
    const securityInfo = {
        contact: 'mailto:security@example.com',
        expires: '2024-12-31T23:59:59Z',
        preferred_languages: 'zh-TW, en'
    };
</script>

<svelte:head>
    <meta name="robots" content="noindex">
</svelte:head>

<!-- 純文字輸出 -->
<pre>
Contact: {securityInfo.contact}
Expires: {securityInfo.expires}
Preferred-Languages: {securityInfo.preferred_languages}
</pre>
````

#### API 版本路由
**目標**：`/api/v1.0/users`

````
src/routes/api/v1[x+2e]0/users/
└ +server.js
````

````javascript
/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return new Response(JSON.stringify({
        version: '1.0',
        users: []
    }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
````

### 7. 最佳實踐建議

1. **優先考慮清晰性**：
   - 盡量使用標準字符
   - 只在必要時使用編碼

2. **文檔化編碼用途**：
   ````javascript
   // 這個路由對應 /.well-known/security.txt
   // 使用編碼是因為 TypeScript 無法處理以 . 開頭的目錄
   // src/routes/[x+2e]well-known/security[x+2e]txt/
   ````

3. **建立編碼字典**：
   ````javascript
   // src/lib/route-mappings.js
   export const ROUTE_MAPPINGS = {
     '[x+2e]well-known': '/.well-known',
     '[x+3a]-[x+29]': '/:-)',
     // ... 其他映射
   };
   ````

4. **測試編碼路由**：
   ````javascript
   // src/routes/[x+3a]-[x+29]/+page.test.js
   import { expect, test } from '@playwright/test';
   
   test('smileys route works', async ({ page }) => {
     await page.goto('/smileys/:-)');
     await expect(page.locator('h1')).toContainText('笑臉頁面');
   });
   ````

### 總結

路由編碼讓 SvelteKit 能夠處理各種特殊字符和標準協議路由，雖然語法看起來複雜，但它提供了強大的靈活性。關鍵是理解何時需要編碼，以及如何正確地使用十六進制和 Unicode 轉義序列。
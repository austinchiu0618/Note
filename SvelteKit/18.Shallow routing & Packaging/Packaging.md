# Packaging

## 🎯 什麼是套件打包？

想像一下，你做了一個很棒的樂高積木組合，朋友們都想要。你有兩個選擇：
1. **給他們整個樂高工廠**（整個 SvelteKit 專案）
2. **打包成樂高積木盒**（製作成可重複使用的套件）

**套件打包**就是第二種做法！你把有用的組件、工具函數打包起來，讓其他開發者可以輕鬆安裝和使用，而不需要了解你的整個專案結構。

### 一般應用 vs 組件庫的差別

**一般 SvelteKit 應用：**
- `src/routes/` 是給用戶看的頁面
- `src/lib/` 是內部使用的工具和組件

**組件庫專案：**
- `src/lib/` 是要分享給別人的東西
- `src/routes/` 可能是說明文件或展示頁面
- `package.json` 決定如何發布

---

## 🏗️ 建立組件庫專案

### 最簡單的開始方式

```bash
# 使用官方工具建立新的組件庫專案
npx sv create my-awesome-library
# 選擇「Library project」選項
```

SvelteKit 會自動幫你設定好一切！

### 專案結構

```
my-awesome-library/
├── src/
│   ├── lib/           # 要分享的組件和工具
│   │   ├── index.js   # 主要入口點
│   │   ├── Button.svelte
│   │   └── utils.js
│   └── routes/        # 展示頁面或說明文件
│       └── +page.svelte
├── package.json       # 套件設定
└── svelte.config.js
```

---

## ⚙️ svelte-package 指令的魔法

### 它做了什麼？

`svelte-package` 就像一個聰明的打包機器人：

1. **檢查你的 `src/lib/` 資料夾**
2. **處理不同類型的檔案**：
   - Svelte 組件：預處理好，讓別人可以直接使用
   - TypeScript：轉換成 JavaScript
   - 一般檔案：直接複製
3. **產生型別定義**：讓 TypeScript 用戶有智能提示
4. **輸出到 `dist/` 資料夾**

### 基本使用

```bash
# 打包一次
npm run package

# 開發時自動監控變化
npm run package -- --watch
```

### 處理過程範例

**你寫的 TypeScript：**
```typescript
export function formatPrice(price: number): string {
	return `$${price.toFixed(2)}`;
}
```

**打包後產生：**
```javascript
export function formatPrice(price) {
	return `$${price.toFixed(2)}`;
}
```

```typescript
export declare function formatPrice(price: number): string;
```

---

## 📋 package.json 的重要設定

### 基本資訊

**name - 套件名稱**
```json
{
	"name": "my-awesome-ui-library"
}
```
這就是別人安裝時用的名稱：`npm install my-awesome-ui-library`

**license - 授權條款**
```json
{
	"license": "MIT"
}
```
告訴別人這個套件可以怎麼使用。MIT 是最寬鬆的選擇，基本上就是「隨便你用，但出事不負責」。

### files - 決定哪些檔案會被發布

```json
{
	"files": ["dist"]
}
```

**自動包含的檔案：**
- `package.json`
- `README.md`
- `LICENSE`

**你需要指定：**
- `dist/` 資料夾（打包後的檔案）

**排除不需要的檔案：**
建立 `.npmignore` 檔案：
```
src/
*.test.js
*.spec.js
.DS_Store
```

---

## 🚪 exports - 套件的入口點

### 最簡單的設定

```json
{
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"svelte": "./dist/index.js"
		}
	}
}
```

**這表示：**
- 用戶可以寫：`import { Button } from 'my-library'`
- TypeScript 會找到型別定義
- 支援 Svelte 的工具知道這是 Svelte 組件庫

### 多個入口點

```json
{
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"svelte": "./dist/index.js"
		},
		"./Button.svelte": {
			"types": "./dist/Button.svelte.d.ts",
			"svelte": "./dist/Button.svelte"
		},
		"./utils": {
			"types": "./dist/utils.d.ts",
			"default": "./dist/utils.js"
		}
	}
}
```

**用戶可以這樣使用：**
```javascript
// 從主入口點匯入
import { Button, Input } from 'my-library';

// 直接匯入特定組件
import Button from 'my-library/Button.svelte';

// 匯入工具函數
import { formatPrice } from 'my-library/utils';
```

### export conditions 的含義

**types**：告訴 TypeScript 去哪裡找型別定義
**svelte**：告訴 Svelte 工具這是 Svelte 組件
**default**：給一般 JavaScript 工具使用

---

## 🔧 其他重要設定

### svelte 欄位（向後相容）

```json
{
	"svelte": "./dist/index.js"
}
```

這是給舊版工具用的，現在有了 `exports` 就不太需要，但保留它比較安全。

### sideEffects - 幫助 Tree Shaking

```json
{
	"sideEffects": ["**/*.css"]
}
```

**什麼是 Side Effects？**
如果你的代碼執行時會「影響外部環境」，就算有副作用：
- 修改全域變數
- 改變內建物件的原型
- 執行 API 呼叫

**為什麼重要？**
打包工具會根據這個資訊決定是否可以安全地移除未使用的代碼。

**範例：**
```json
{
	"sideEffects": [
		"**/*.css",
		"./dist/global-setup.js"
	]
}
```

---

## 📝 TypeScript 支援

### 為什麼要提供型別定義？

即使你自己不用 TypeScript，提供型別定義還是很重要：
- 讓用戶有智能提示
- 避免使用錯誤
- 提升開發體驗

### 自動產生型別

`svelte-package` 會自動為你產生型別定義，你只需要確保 `exports` 有指向正確的 `.d.ts` 檔案。

### 多入口點的型別問題

**問題：**
TypeScript 預設不會看 `exports` 中的 `types` 條件。

**解決方案一：要求用戶設定 tsconfig.json**
```json
{
	"compilerOptions": {
		"moduleResolution": "bundler"
	}
}
```

**解決方案二：使用 typesVersions 技巧**
```json
{
	"exports": {
		"./foo": {
			"types": "./dist/foo.d.ts",
			"svelte": "./dist/foo.js"
		}
	},
	"typesVersions": {
		">4.0": {
			"foo": ["./dist/foo.d.ts"]
		}
	}
}
```

---

## 📚 實際組件庫範例

### 簡單的 UI 組件庫

```javascript
index.js
export { default as Button } from './Button.svelte';
export { default as Input } from './Input.svelte';
export { default as Modal } from './Modal.svelte';
export * from './utils.js';
```

```svelte
<script>
	let { 
		variant = 'primary',
		size = 'medium',
		disabled = false,
		onclick,
		children 
	} = $props();
</script>

<button 
	class="btn btn-{variant} btn-{size}"
	{disabled}
	{onclick}
>
	{@render children()}
</button>
```

```javascript
export function formatCurrency(amount, currency = 'USD') {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency
	}).format(amount);
}

export function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
```

### Store 專用庫

```javascript
lib/index.js
export { writable, readable } from 'svelte/store';
export { createCounter } from './counter.js';
export { createLocalStorage } from './localStorage.js';
```

```javascript
/counter.js
import { writable } from 'svelte/store';

export function createCounter(initialValue = 0) {
	const { subscribe, set, update } = writable(initialValue);

	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		reset: () => set(initialValue)
	};
}
```

---

## 💡 最佳實踐建議

### 1. 避免 SvelteKit 特定功能

**❌ 不好的做法：**
```javascript
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
```

**✅ 好的做法：**
```javascript
import { BROWSER } from 'esm-env';

// 把導航邏輯作為 props 傳入
let { onNavigate } = $props();
```

### 2. 讓組件更通用

```svelte
<!-- 不依賴特定的路由或狀態管理 -->
<script>
	let { 
		currentUser,
		onLogin,
		onLogout 
	} = $props();
</script>

{#if currentUser}
	<button onclick={onLogout}>登出</button>
{:else}
	<button onclick={onLogin}>登入</button>
{/if}
```

### 3. 使用別名要放對地方

```javascript
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		alias: {
			'$components': 'src/lib/components',
			'$utils': 'src/lib/utils'
		}
	}
};

export default config;
```

### 4. 版本管理要謹慎

**重大變更（需要升級主版本）：**
- 移除任何 exports 路徑
- 改變組件的 props 介面
- 移除公開的函數

**功能新增（升級次版本）：**
- 新增 exports 路徑
- 新增組件或函數
- 向後相容的 props 新增

---

## ⚙️ 進階設定選項

### 自訂輸入輸出路徑

```bash
# 自訂輸入路徑
svelte-package --input src/components --output build

# 監控模式
svelte-package --watch

# 不產生型別定義
svelte-package --types false
```

### 自訂 tsconfig

```bash
svelte-package --tsconfig ./custom.tsconfig.json
```

---

## 🚀 發布套件

### 準備發布

```bash
# 1. 確保版本正確
npm version patch  # 或 minor、major

# 2. 打包
npm run package

# 3. 檢查打包結果
ls dist/

# 4. 測試安裝（可選）
npm pack
```

### 發布到 npm

```bash
# 登入 npm
npm login

# 發布
npm publish

# 發布測試版
npm publish --tag beta
```

### 發布檢查清單

- [ ] README 寫得清楚
- [ ] LICENSE 檔案存在
- [ ] package.json 資訊正確
- [ ] 所有 exports 都能正常匯入
- [ ] 型別定義正確產生
- [ ] 版本號碼合理

---

## ⚠️ 常見限制和解決方案

### 檔案匯入必須完整

**問題：**
```javascript
// ❌ 這樣不行
import { utils } from './utils';

// ✅ 必須寫完整
import { utils } from './utils/index.js';
```

**TypeScript 的特殊情況：**
```typescript
// TypeScript 檔案也要用 .js 結尾
import { helper } from './helper.js';  // 實際檔案是 helper.ts
```

### 設定 tsconfig 幫助解決

```json
{
	"compilerOptions": {
		"moduleResolution": "NodeNext"
	}
}
```

---

## 🎯 總結重點

### 套件打包的核心價值

1. **代碼重用**：一次寫好，到處使用
2. **簡化分享**：不用複製貼上檔案
3. **版本管理**：清楚的版本控制和更新機制
4. **生態貢獻**：豐富 Svelte 生態系統

### 關鍵概念回顧

- **src/lib/** 是要分享的內容
- **svelte-package** 自動處理打包和型別產生
- **package.json** 的 exports 控制如何匯入
- **最佳實踐**：保持通用性，避免框架特定功能

### 成功套件的特質

1. **清楚的文件**：讓人知道怎麼用
2. **穩定的 API**：不隨便做重大變更
3. **型別支援**：即使不用 TypeScript 也要提供
4. **測試完整**：確保功能正確

SvelteKit 的套件打包功能讓分享代碼變得非常簡單，只要理解基本概念，任何人都可以建立有用的組件庫並貢獻給社群！
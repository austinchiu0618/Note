## 🎯 錯誤處理概念

SvelteKit 的錯誤處理系統會根據三個關鍵因素來決定如何處理錯誤：
- **錯誤發生的位置**（在哪個函數或組件中）
- **錯誤的類型**（預期 vs 意外）
- **請求的性質**（是頁面請求還是 API 請求）

## 📝 錯誤對象的基本結構

所有錯誤在 SvelteKit 中都表示為一個對象，預設包含：
```javascript
{ message: string }
```

您可以擴展這個對象，添加更多屬性如 `code`、`id` 等。

---

## 🎯 預期錯誤（Expected Errors）

### 什麼是預期錯誤？
預期錯誤是**開發者主動拋出的錯誤**，用於處理已知的異常情況。

### 如何創建預期錯誤

````javascript
import { error } from '@sveltejs/kit';
import * as db from '$lib/server/database';

export async function load({ params }) {
  const post = await db.getPost(params.slug);

  if (!post) {
    // 拋出 404 錯誤
    error(404, {
      message: '未找到'
    });
  }

  return { post };
}
````

### 錯誤處理流程
1. **拋出異常**：使用 `error()` 函數
2. **SvelteKit 捕獲**：自動捕獲異常
3. **設置狀態碼**：設置 HTTP 狀態碼（如 404）
4. **渲染錯誤頁面**：顯示 `+error.svelte` 組件

### 錯誤頁面組件

````svelte
<script>
  import { page } from '$app/state';
</script>

<h1>{page.error.message}</h1>
````

### 添加自定義屬性

````javascript
error(404, {
  message: '未找到',
  code: 'NOT_FOUND'
});
````

### 簡化寫法

````javascript
// 簡化版本
error(404, '未找到');

// 等同於
error(404, { message: '未找到' });
````

---

## ⚠️ 意外錯誤（Unexpected Errors）

### 什麼是意外錯誤？
意外錯誤是**系統運行時發生的異常**，如資料庫連接失敗、程式碼錯誤等。

### 安全特性
- **不會暴露敏感信息**給用戶
- 錯誤詳情只在伺服器端記錄
- 用戶只會看到通用錯誤消息

### 預設行為
```json
{ "message": "內部錯誤" }
```

### 自定義處理
可以通過 `handleError` hook 來添加自定義邏輯：
- 發送錯誤報告到監控服務
- 返回自定義錯誤對象
- 記錄詳細日誌

---

## 📤 錯誤響應機制

### 響應類型
SvelteKit 會根據請求的 `Accept` 頭決定響應格式：
- **HTML 請求**：返回錯誤頁面
- **JSON 請求**：返回 JSON 錯誤對象

### 自定義回退錯誤頁面

````html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>%sveltekit.error.message%</title>
	</head>
	<body>
		<h1>我的自定義錯誤頁面</h1>
		<p>狀態：%sveltekit.status%</p>
		<p>消息：%sveltekit.error.message%</p>
	</body>
</html>
````

### 錯誤邊界規則

| 錯誤位置 | 渲染的錯誤頁面 |
|---------|---------------|
| `load` 函數 | 最近的 `+error.svelte` |
| 布局 `load` 函數 | 上層的 `+error.svelte` |
| 根布局 `load` | 回退錯誤頁面 |

---

## 🔒 TypeScript 類型安全

### 定義自定義錯誤接口

````typescript
declare global {
  namespace App {
    interface Error {
      code: string;
      id: string;
    }
  }
}

export {};
````

### 重要注意事項
- 接口始終包含 `message: string` 屬性
- 必須在 TypeScript 可見的位置聲明
- 通常放在 `src/app.d.ts` 文件中

---

## 🌟 實際應用範例

### 完整的錯誤處理流程

````javascript
import { error, json } from '@sveltejs/kit';

export async function GET({ params }) {
  try {
    const user = await getUserById(params.id);
    
    if (!user) {
      // 預期錯誤
      error(404, {
        message: '用戶不存在',
        code: 'USER_NOT_FOUND'
      });
    }
    
    return json(user);
  } catch (err) {
    // 意外錯誤會被 handleError hook 處理
    throw err;
  }
}
````

### 錯誤頁面處理不同狀態

````svelte
<script>
  import { page } from '$app/state';
  
  $: errorCode = page.status;
  $: errorMessage = page.error.message;
</script>

{#if errorCode === 404}
  <h1>頁面未找到</h1>
  <p>抱歉，您訪問的頁面不存在。</p>
{:else if errorCode >= 500}
  <h1>伺服器錯誤</h1>
  <p>伺服器發生問題，請稍後再試。</p>
{:else}
  <h1>發生錯誤</h1>
  <p>{errorMessage}</p>
{/if}
````

這個錯誤處理系統提供了完整且安全的錯誤管理，確保用戶體驗的同時保護敏感信息不被洩露。
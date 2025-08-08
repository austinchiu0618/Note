# Server-only modules

## 🎯 什麼是僅服務端模組？

想像一下，你有一個保險箱，裡面放著重要的密碼和鑰匙。你絕對不會把這些東西拿到外面給別人看，對吧？**僅服務端模組**就是 SvelteKit 的「數位保險箱」。

### 為什麼需要這個保險箱？

在開發網站時，我們經常會遇到這種情況：
- **前端代碼**：用戶可以在瀏覽器中看到和下載
- **後端代碼**：只在伺服器上執行，用戶看不到

問題是，當你把前端和後端寫在同一個專案裡時，很容易不小心把「秘密資料」寫到前端去！這就像把保險箱的密碼寫在門口一樣危險。

### SvelteKit 的保護機制

SvelteKit 就像一個貼心的朋友，會幫你看管這些秘密：
- 自動檢查哪些代碼會被送到瀏覽器
- 如果發現你不小心洩露秘密，立刻警告你
- 提供安全的方式來處理敏感資料

---

## 🔐 私有環境變數

### 什麼是環境變數？

環境變數就像是你程式的「設定清單」，裡面記錄著各種重要資訊：
- 資料庫的網址和密碼
- 第三方 API 的金鑰
- 郵件服務的設定

這些資訊**絕對不能**讓用戶看到！

### SvelteKit 的兩種私有環境變數

**靜態私有變數 - `$env/static/private`**
```javascript
// 在伺服器檔案中使用
import { DATABASE_PASSWORD, API_SECRET_KEY } from '$env/static/private';
```
- 在建置時就確定值，不會改變
- 效能最好，因為 SvelteKit 可以做最佳化

**動態私有變數 - `$env/dynamic/private`**
```javascript
// 在伺服器檔案中使用
import { env } from '$env/dynamic/private';
console.log(env.DATABASE_PASSWORD);
```
- 執行時才取得值，可以動態改變
- 比較有彈性，但稍微慢一點

### 只有這些檔案可以使用私有變數

就像保險箱只能由特定的人打開一樣，只有這些「伺服器專用」的檔案可以存取私有變數：

- `hooks.server.js` - 整個應用的伺服器設定
- `+page.server.js` - 特定頁面的伺服器邏輯
- `+layout.server.js` - 版面的伺服器邏輯
- `$lib/server/` 資料夾中的任何檔案

---

## 🛠️ 僅服務端工具

### $app/server 模組

SvelteKit 提供了一個特殊的工具箱 `$app/server`，裡面有一些只能在伺服器使用的工具。

**read 函數 - 讀取檔案**
```javascript
import { read } from '$app/server';

export async function load() {
	// 讀取伺服器上的設定檔
	const configContent = read('config/database.json');
	
	// 處理設定並回傳給頁面
	return {
		settings: JSON.parse(configContent)
	};
}
```

**為什麼這個功能很重要？**
- 可以讀取伺服器檔案系統中的檔案
- 載入大型設定檔或資料檔
- 處理只存在伺服器上的資源

---

## 📁 如何建立僅服務端模組？

有兩種方式可以告訴 SvelteKit：「這個檔案是只給伺服器用的」

### 方法一：在檔案名稱加上 .server

```javascript
import { DATABASE_URL } from '$env/static/private';

export async function connectToDatabase() {
	// 連接資料庫的邏輯
	return await connect(DATABASE_URL);
}

export async function getUserData(userId) {
	const db = await connectToDatabase();
	return await db.users.findById(userId);
}
```

### 方法二：放在 $lib/server 資料夾

```javascript
import { JWT_SECRET } from '$env/static/private';

export function generateAuthToken(user) {
	// 產生認證 token
	return jwt.sign({ userId: user.id }, JWT_SECRET);
}

export function verifyAuthToken(token) {
	// 驗證 token 是否有效
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
}
```

**兩種方法的差別：**
- `.server.js` 方式：可以放在任何地方，檔名就能說明用途
- `$lib/server/` 方式：統一管理，一看資料夾就知道都是伺服器代碼

---

## ⚠️ SvelteKit 的安全檢查

### 為什麼需要這麼嚴格的檢查？

即使你在前端只用了一個很小的功能，整個模組的代碼（包括秘密資料）都可能被打包進去送到瀏覽器。這就像你只想分享一張照片，結果整本相簿都被看光了！

### 實際的錯誤情境

```javascript
// ❌ 危險的做法
// filepath: src/lib/server/secrets.js
export const atlantisCoordinates = [40.7128, -74.0060]; // 秘密座標
```

```javascript
// 這個檔案不小心匯出了秘密資料
export { atlantisCoordinates } from '$lib/server/secrets.js';

// 還有其他正常的功能
export const add = (a, b) => a + b;
```

```svelte
<script>
	// 前端只想用 add 函數，但無意中也包含了秘密資料
	import { add } from './utils.js';
</script>

<p>計算結果：{add(2, 3)}</p>
```

**SvelteKit 會立刻阻止這種情況**：
```
錯誤：不能在公開代碼中匯入 $lib/server/secrets.js
匯入路徑：
- src/routes/+page.svelte
  - src/routes/utils.js
    - $lib/server/secrets.js
```

### 這個警告告訴我們什麼？

1. **問題來源**：`+page.svelte` 是前端代碼
2. **傳播路徑**：透過 `utils.js` 間接匯入了伺服器代碼
3. **解決方案**：需要重新設計代碼結構，避免這種間接匯入

---

## 🔄 動態匯入的注意事項

### 什麼是動態匯入？

動態匯入就是在程式執行時才決定要載入哪個模組：

```javascript
// 一般匯入（靜態）
import { someFunction } from './module.js';

// 動態匯入
const module = await import('./module.js');
const result = await import(`./${fileName}.js`); // 根據變數決定檔案
```

### 動態匯入的檢查限制

SvelteKit 的安全檢查對動態匯入有一個小限制：

**單層動態匯入**：可以正常檢查
```javascript
// 可以檢測到
const module = await import('$lib/server/secrets.js'); // 會被阻止
```

**多層動態匯入**：第一次載入時可能檢查不到
```javascript
// 可能在開發時第一次載入檢查不到
const moduleA = await import('./moduleA.js');
// moduleA.js 裡面又動態匯入了伺服器模組
```

**解決方案**：
- 盡量避免複雜的動態匯入鏈
- 明確分離伺服器和客戶端代碼
- 定期檢查建置結果

---

## 🧪 測試環境的特殊情況

### 為什麼測試時會關閉檢查？

在寫單元測試時，測試框架（如 Vitest）通常需要：
- 同時存取前端和後端代碼
- 模擬各種情況，包括錯誤情況
- 測試伺服器邏輯

如果在測試時也嚴格執行這些限制，會讓測試變得很困難。

### 自動檢測機制

SvelteKit 會自動檢查環境變數：
```javascript
// 當 process.env.TEST === 'true' 時，關閉僅服務端檢查
```

這表示：
- **開發和生產環境**：嚴格檢查，保護安全
- **測試環境**：放寬限制，方便測試

### 測試時的注意事項

即使測試時關閉了檢查，你還是應該：
- 確保測試覆蓋了安全相關的功能
- 在測試完成後，在開發環境中驗證安全性
- 不要依賴測試環境的寬鬆限制來寫不安全的代碼

---

## 📚 實際應用範例

### 用戶認證系統

```javascript
import { JWT_SECRET, BCRYPT_ROUNDS } from '$env/static/private';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function hashPassword(password) {
	return await bcrypt.hash(password, parseInt(BCRYPT_ROUNDS));
}

export async function verifyPassword(password, hashedPassword) {
	return await bcrypt.compare(password, hashedPassword);
}

export function createSession(user) {
	return jwt.sign(
		{ userId: user.id, email: user.email },
		JWT_SECRET,
		{ expiresIn: '7d' }
	);
}
```

```javascript
import { hashPassword, verifyPassword, createSession } from '$lib/server/auth.js';

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');
		
		// 驗證用戶
		const user = await getUserByEmail(email);
		if (user && await verifyPassword(password, user.hashedPassword)) {
			const sessionToken = createSession(user);
			cookies.set('session', sessionToken, { httpOnly: true });
			return { success: true };
		}
		
		return { error: '帳號或密碼錯誤' };
	}
};
```

### 資料庫操作

```javascript
import { DATABASE_URL } from '$env/static/private';

export async function connectDatabase() {
	// 實際的資料庫連線邏輯
	return await connect(DATABASE_URL);
}

export async function getUsers() {
	const db = await connectDatabase();
	return await db.collection('users').find().toArray();
}

export async function createUser(userData) {
	const db = await connectDatabase();
	return await db.collection('users').insertOne(userData);
}
```

---

## 🎯 最佳實踐建議

### 1. 設計原則

**明確分離職責**
- 所有敏感邏輯都放在 `.server.js` 檔案
- 前端只處理用戶介面和非敏感邏輯
- 通過 `+page.server.js` 在兩者間安全地傳遞資料

**最小權限原則**
- 只在真正需要的地方使用私有環境變數
- 不要在前端暴露任何不必要的資訊
- 定期檢查哪些資料真的需要送到前端

### 2. 檔案組織

```
src/
├── lib/
│   ├── components/          # 前端組件
│   ├── utils/              # 前端工具函數
│   └── server/             # 伺服器專用
│       ├── auth.js         # 認證邏輯
│       ├── database.js     # 資料庫操作
│       └── email.js        # 郵件服務
├── routes/
│   ├── +layout.svelte      # 前端版面
│   ├── +layout.server.js   # 伺服器版面邏輯
│   └── api/
│       └── users/
│           └── +server.js  # API 端點
```

### 3. 環境變數管理

```bash
# .env 檔案範例
# 公開變數（前端可以使用）
PUBLIC_APP_NAME=My Awesome App
PUBLIC_API_BASE_URL=https://api.example.com

# 私有變數（只有伺服器可以使用）
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=super-secret-key-here
EMAIL_API_KEY=smtp-service-key
```

### 4. 錯誤處理

```javascript
import { DEV } from '$app/environment';

export function handleServerError(error, context) {
	// 記錄完整錯誤資訊（只在伺服器）
	console.error(`Error in ${context}:`, error);
	
	// 回傳安全的錯誤訊息給前端
	return {
		message: DEV ? error.message : '系統發生錯誤，請稍後再試',
		code: error.code || 'UNKNOWN_ERROR'
	};
}
```

---

## 🎯 總結重點

### 僅服務端模組的核心價值

1. **安全第一**：自動防止敏感資料洩露到前端
2. **開發友善**：清楚的錯誤訊息幫你找到問題
3. **零配置**：只要放對位置就自動生效

### 關鍵概念回顧

- **私有環境變數**：敏感設定只在伺服器可見
- **$app/server**：伺服器專用的工具模組
- **安全檢查**：自動防止間接洩露
- **測試考量**：測試環境的特殊處理

### 記住這些原則

1. **疑慮時選擇安全**：不確定的話就放在伺服器端
2. **明確分離**：前端和後端邏輯要清楚區分
3. **定期檢查**：確保沒有意外暴露敏感資訊
4. **測試重要**：安全機制也要測試

SvelteKit 的僅服務端模組就像一個貼心的保全系統，讓你專注在功能開發上，而不用擔心安全漏洞。記住：當你把秘密交給 SvelteKit 保管時，它會盡全力守護這些秘密！
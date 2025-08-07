## 🏷️ Headers 是什麼？

Headers 就像是 HTTP 請求和回應的「標籤」，用來傳遞額外的資訊。

## 🎯 SvelteKit 中的 setHeaders 功能

### 基本概念
````javascript
// 在 load 函數中設置回應 headers
export async function load({ setHeaders }) {
    setHeaders({
        'cache-control': 'max-age=3600',  // 快取 1 小時
        'content-type': 'application/json'
    });
    
    return { message: 'Hello' };
}
````

## 📝 實用範例

### 1. **設定快取**
````javascript
// +page.js
export async function load({ fetch, setHeaders }) {
    const response = await fetch('https://api.example.com/products');
    
    // 把 API 的快取設定套用到我們的頁面
    setHeaders({
        'cache-control': response.headers.get('cache-control')
    });
    
    return {
        products: await response.json()
    };
}
````

**效果**：
```
瀏覽器收到頁面時：
├── HTML 內容
└── Headers: cache-control: max-age=3600

瀏覽器知道：
"這個頁面可以快取 1 小時，不用重新請求"
```

### 2. **安全性標頭**
````javascript
export async function load({ setHeaders }) {
    setHeaders({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
    });
    
    return { data: 'secure content' };
}
````

### 3. **從 API 繼承標頭**
````javascript
export async function load({ fetch, setHeaders }) {
    const apiResponse = await fetch('/api/data');
    
    // 複製 API 的快取設定
    setHeaders({
        age: apiResponse.headers.get('age'),
        'cache-control': apiResponse.headers.get('cache-control')
    });
    
    return {
        data: await apiResponse.json()
    };
}
````

## ⚠️ 重要限制

### 1. **只在伺服器端有效**
```
🖥️ 伺服器端：setHeaders() ✅ 有效果
🌐 瀏覽器端：setHeaders() ❌ 不會執行
```

### 2. **每個標頭只能設一次**
````javascript
// ❌ 錯誤：重複設定
setHeaders({ 'cache-control': 'max-age=3600' });
setHeaders({ 'cache-control': 'no-cache' }); // 會出錯！

// ✅ 正確：一次設定多個
setHeaders({
    'cache-control': 'max-age=3600',
    'content-type': 'text/html'
});
````

### 3. **不能設定 cookies**
````javascript
// ❌ 錯誤
setHeaders({ 'set-cookie': 'session=abc123' });

// ✅ 正確：使用 cookies API
export async function load({ cookies }) {
    cookies.set('session', 'abc123');
}
````

## 🚀 實際應用場景

### 快取部落格文章
````javascript
// +page.server.js
export async function load({ params, setHeaders }) {
    const post = await getPost(params.slug);
    
    // 快取 24 小時
    setHeaders({
        'cache-control': 'public, max-age=86400'
    });
    
    return { post };
}
````

### 設定安全標頭
````javascript
// +layout.server.js
export async function load({ setHeaders }) {
    setHeaders({
        'Strict-Transport-Security': 'max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    
    return {};
}
````

## 💡 簡單記憶

**setHeaders 的作用**：
- 🏷️ 給回應貼上「標籤」
- ⚡ 告訴瀏覽器如何處理頁面
- 🔒 增加安全性
- 💾 控制快取行為

**何時使用**：
- 需要快取頁面時
- 需要設定安全標頭時  
- 需要從 API 繼承標頭時

**記住**：只在伺服器端有效，每個標頭只能設一次！
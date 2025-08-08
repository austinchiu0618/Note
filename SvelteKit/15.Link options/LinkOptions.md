# 🔗 Link options 鏈接選項

## 🎯 什麼是鏈接選項？

簡單來說，鏈接選項就是讓你控制網站中的超連結要怎麼運作的設定。想像一下，你在逛網站時點擊連結，有時候你希望頁面載入得快一點，有時候你不希望頁面跳到最上面，有時候你希望搜尋框保持焦點狀態 - 這些都可以透過鏈接選項來控制！

### 為什麼需要這些選項？

在傳統網站中，每次點擊連結都要重新載入整個頁面，很慢也很耗費資源。SvelteKit 使用「客戶端路由」讓頁面切換變得很快，但有時候我們需要更精細的控制，這就是鏈接選項派上用場的地方。

---

## 🚀 預載入是什麼？

### 預載入的概念

「預載入」就像是你還沒點擊連結之前，網站就偷偷開始準備那個頁面的資料了。這樣當你真的點擊時，頁面就能瞬間出現！

想像你在餐廳看菜單，聰明的廚師看到你盯著某道菜看很久，就開始準備食材。當你真的點餐時，菜就能很快上桌。

### 兩種預載入方式

1. **預載入代碼**：先準備好頁面的程式碼
2. **預載入數據**：先準備好頁面需要的資料

---

## 📊 data-sveltekit-preload-data (預載入數據)

### 什麼時候預載入數據？

**hover (滑鼠懸停時)**
```svelte
<a href="/products" data-sveltekit-preload-data="hover">
  商品頁面
</a>
```
當你的滑鼠移到連結上時，就開始載入商品資料。等你真的點擊時，頁面馬上就能顯示！

**tap (點擊時)**
```svelte
<a href="/stock-prices" data-sveltekit-preload-data="tap">
  即時股價
</a>
```
只有在你真的按下滑鼠時才開始載入。適合那些資料變化很快的頁面，因為提早載入可能會拿到過時的資料。

### 實際應用範例

```svelte
<!-- 部落格文章列表 -->
<div data-sveltekit-preload-data="hover">
  {#each articles as article}
    <h3>
      <a href="/blog/{article.slug}">
        {article.title}
      </a>
    </h3>
  {/each}
</div>
```

這樣設定後，當用戶滑鼠移到任何文章標題上時，就會開始載入那篇文章的內容。

---

## 💻 data-sveltekit-preload-code (預載入代碼)

### 四種預載入策略

**eager (立即載入)**
```svelte
<a href="/dashboard" data-sveltekit-preload-code="eager">
  儀表板
</a>
```
頁面一載入就馬上準備儀表板的代碼。適合用戶很可能會點擊的重要連結。

**viewport (進入視窗時)**
```svelte
<a href="/reports" data-sveltekit-preload-code="viewport">
  報表頁面
</a>
```
當這個連結出現在用戶的螢幕上時才開始載入。適合放在頁面下方的連結。

**hover (滑鼠懸停時)**
```svelte
<a href="/settings" data-sveltekit-preload-code="hover">
  設定頁面
</a>
```
滑鼠移上去時才載入。最常用的設定，平衡了效能和用戶體驗。

**tap (點擊時)**
```svelte
<a href="/help" data-sveltekit-preload-code="tap">
  幫助頁面
</a>
```
最保守的策略，點擊時才載入。

### 實際應用

```svelte
<!-- 重要功能：立即載入 -->
<nav>
  <a href="/home" data-sveltekit-preload-code="eager">首頁</a>
  <a href="/profile" data-sveltekit-preload-code="eager">個人資料</a>
</nav>

<!-- 一般內容：懸停時載入 -->
<section>
  {#each posts as post}
    <a href="/posts/{post.id}" data-sveltekit-preload-code="hover">
      {post.title}
    </a>
  {/each}
</section>

<!-- 不常用的頁面：點擊時載入 -->
<footer>
  <a href="/terms" data-sveltekit-preload-code="tap">使用條款</a>
  <a href="/privacy" data-sveltekit-preload-code="tap">隱私政策</a>
</footer>
```

---

## 🔄 data-sveltekit-reload (強制重新載入)

### 什麼時候需要？

有些情況下，你希望連結像傳統網站一樣完全重新載入頁面：

```svelte
<!-- 需要重新驗證身份 -->
<a href="/admin" data-sveltekit-reload>
  管理後台
</a>

<!-- API 端點，需要瀏覽器下載檔案 -->
<a href="/api/download-report" data-sveltekit-reload>
  下載報表
</a>

<!-- 第三方支付頁面 -->
<a href="/payment" data-sveltekit-reload>
  前往付款
</a>
```

### 白話解釋

就像是告訴瀏覽器：「這個連結不要用 SvelteKit 的快速導航，請用傳統的方式處理」。

---

## 📚 data-sveltekit-replacestate (替換歷史記錄)

### 解決什麼問題？

有時候你不希望在瀏覽器的「上一頁」歷史中留下某些頁面。

```svelte
<!-- 搜尋結果的分頁 -->
<a href="/search?page=2" data-sveltekit-replacestate>
  下一頁
</a>

<!-- 表單的步驟 -->
<a href="/form?step=2" data-sveltekit-replacestate>
  下一步
</a>
```

### 實際場景

想像你在看搜尋結果，翻了 5 頁。如果沒有 `replacestate`，你要按 5 次「上一頁」才能回到搜尋頁面。有了它，只要按一次就回到搜尋頁面了。

---

## 🎯 data-sveltekit-keepfocus (保持焦點)

### 什麼是焦點？

焦點就是目前「選中」的元素，通常是輸入框或按鈕。當你按 Tab 鍵時，焦點會在頁面上移動。

### 使用場景

```svelte
<!-- 即時搜尋表單 -->
<form data-sveltekit-keepfocus>
  <input type="search" name="query" placeholder="搜尋..." />
</form>
```

這樣設定後，當搜尋結果更新時，用戶的游標還是會停在搜尋框裡，可以繼續輸入。

### 注意事項

- 通常用在表單上，不要用在一般連結上
- 只在元素依然存在時使用
- 對使用螢幕閱讀器的用戶很重要

---

## 📜 data-sveltekit-noscroll (不要滾動)

### 預設行為

正常情況下，點擊連結會讓頁面滾動到最上面，就像傳統網站一樣。

### 什麼時候不要滾動？

```svelte
<!-- 標籤頁導航 -->
<nav>
  <a href="?tab=profile" data-sveltekit-noscroll>個人資料</a>
  <a href="?tab=settings" data-sveltekit-noscroll>設定</a>
  <a href="?tab=billing" data-sveltekit-noscroll>帳單</a>
</nav>

<!-- 分頁導航 -->
<div>
  <a href="?page=2" data-sveltekit-noscroll>下一頁</a>
</div>
```

### 使用情境

當你希望用戶看到的內容位置保持不變時使用。比如用戶正在看一個很長的表單，切換標籤時不希望頁面跳回最上面。

---

## ❌ 禁用選項

### 繼承與覆蓋

```svelte
<!-- 父層設定所有連結都預載入 -->
<div data-sveltekit-preload-data="hover">
  
  <!-- 這些連結會預載入 -->
  <a href="/page1">頁面 1</a>
  <a href="/page2">頁面 2</a>
  
  <!-- 這個區域禁用預載入 -->
  <div data-sveltekit-preload-data="false">
    <a href="/heavy-page">大型頁面</a>
    <a href="/slow-page">載入慢的頁面</a>
  </div>
  
</div>
```

### 條件式設定

```svelte
<script>
  let isPremiumUser = true;
  let hasSlowConnection = false;
</script>

<!-- 根據條件決定是否預載入 -->
<div data-sveltekit-preload-data={isPremiumUser && !hasSlowConnection ? 'hover' : false}>
  <a href="/premium-features">高級功能</a>
</div>
```

---

## 🏷️ 表單也可以使用

### GET 表單的鏈接選項

```svelte
<!-- 搜尋表單 -->
<form 
  method="GET" 
  action="/search"
  data-sveltekit-keepfocus
  data-sveltekit-noscroll
>
  <input type="search" name="q" />
  <button type="submit">搜尋</button>
</form>
```

這個搜尋表單會：
- 保持搜尋框的焦點 (`keepfocus`)
- 不會滾動到頁面頂部 (`noscroll`)

---

## 💡 實用技巧

### 1. 全域設定

在 `src/app.html` 中設定：

```html
<body data-sveltekit-preload-data="hover">
  <div style="display: contents">%sveltekit.body%</div>
</body>
```

這樣整個網站的連結都會在 hover 時預載入數據。

### 2. 根據網路狀況調整

```svelte
<script>
  import { browser } from '$app/environment';
  
  let slowConnection = false;
  
  if (browser && navigator.connection) {
    slowConnection = navigator.connection.saveData || 
                    navigator.connection.effectiveType === 'slow-2g';
  }
</script>

<div data-sveltekit-preload-data={slowConnection ? false : 'hover'}>
  <!-- 連結內容 -->
</div>
```

### 3. 分級預載入策略

```svelte
<!-- 關鍵功能：積極預載入 -->
<nav data-sveltekit-preload-code="eager" data-sveltekit-preload-data="hover">
  <a href="/dashboard">儀表板</a>
  <a href="/messages">訊息</a>
</nav>

<!-- 一般內容：適中策略 -->
<main data-sveltekit-preload-code="viewport" data-sveltekit-preload-data="hover">
  {#each articles as article}
    <a href="/articles/{article.id}">{article.title}</a>
  {/each}
</main>

<!-- 次要功能：保守策略 -->
<footer data-sveltekit-preload-code="tap" data-sveltekit-preload-data="false">
  <a href="/about">關於我們</a>
  <a href="/contact">聯絡我們</a>
</footer>
```

---

## 🎯 總結建議

### 什麼時候用什麼？

**預載入數據 (preload-data)**
- `hover`：一般內容，用戶可能會點擊
- `tap`：變化快速的數據（如股價、即時訊息）
- `false`：不需要預載入的內容

**預載入代碼 (preload-code)**
- `eager`：重要功能，用戶很可能使用
- `viewport`：頁面下方的內容
- `hover`：一般情況，最平衡的選擇
- `tap`：不常用的功能

**其他選項**
- `reload`：需要完整重新載入的頁面
- `replacestate`：分頁、步驟式表單
- `keepfocus`：搜尋表單、過濾器
- `noscroll`：標籤頁、分頁導航

記住，這些選項的目標是讓用戶體驗更好，不要為了使用而使用。先思考用戶的需求，再選擇合適的選項！
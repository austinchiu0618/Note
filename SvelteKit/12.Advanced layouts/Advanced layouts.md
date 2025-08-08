## Advanced layouts

### 核心概念

**預設情況**：佈局層次結構 = 路由層次結構  
**高級佈局**：允許您打破這個規則，創建更靈活的佈局組織

### 1. 路由分組 (Route Groups)

**問題場景**：不同類型的頁面需要不同的佈局

````
src/routes/
├ (app)/              ← 應用頁面羣組
│ ├ dashboard/
│ ├ profile/
│ ├ settings/
│ └ +layout.svelte    ← 應用佈局
├ (marketing)/        ← 行銷頁面羣組
│ ├ about/
│ ├ pricing/
│ ├ contact/
│ └ +layout.svelte    ← 行銷佈局
├ admin/              ← 管理頁面（不屬於任何羣組）
└ +layout.svelte      ← 根佈局
````

**應用佈局範例**：

````svelte
<script>
    /** @type {import('./$types').LayoutData} */
    let { data, children } = $props();
</script>

<div class="app-layout">
    <!-- 應用導航 -->
    <header class="app-header">
        <nav>
            <a href="/dashboard">儀錶板</a>
            <a href="/profile">個人資料</a>
            <a href="/settings">設定</a>
        </nav>
        <div class="user-info">
            <span>歡迎，{data.user.name}</span>
            <button>登出</button>
        </div>
    </header>
    
    <!-- 側邊欄 -->
    <aside class="sidebar">
        <div class="quick-actions">
            <button>新增專案</button>
            <button>匯入資料</button>
        </div>
    </aside>
    
    <!-- 主要內容 -->
    <main class="app-content">
        {@render children()}
    </main>
</div>

<style>
    .app-layout {
        display: grid;
        grid-template-areas: 
            "header header"
            "sidebar content";
        grid-template-columns: 250px 1fr;
        grid-template-rows: 60px 1fr;
        min-height: 100vh;
    }
    
    .app-header { grid-area: header; }
    .sidebar { grid-area: sidebar; }
    .app-content { grid-area: content; }
</style>
````

**行銷佈局範例**：

````svelte
<script>
    /** @type {import('./$types').LayoutData} */
    let { data, children } = $props();
</script>

<div class="marketing-layout">
    <!-- 行銷導航 -->
    <header class="marketing-header">
        <div class="logo">
            <img src="/logo.svg" alt="公司標誌">
        </div>
        <nav>
            <a href="/about">關於我們</a>
            <a href="/pricing">價格方案</a>
            <a href="/contact">聯絡我們</a>
        </nav>
        <div class="cta-buttons">
            <a href="/login">登入</a>
            <a href="/signup" class="btn-primary">免費試用</a>
        </div>
    </header>
    
    <!-- 主要內容 -->
    <main>
        {@render children()}
    </main>
    
    <!-- 行銷頁腳 -->
    <footer class="marketing-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>產品</h3>
                <ul>
                    <li><a href="/features">功能特色</a></li>
                    <li><a href="/integrations">整合服務</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>支援</h3>
                <ul>
                    <li><a href="/docs">文檔</a></li>
                    <li><a href="/help">幫助中心</a></li>
                </ul>
            </div>
        </div>
    </footer>
</div>

<style>
    .marketing-layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    
    .marketing-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: white;
        border-bottom: 1px solid #eee;
    }
    
    main {
        flex: 1;
    }
    
    .btn-primary {
        background: #007acc;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
    }
</style>
````

### 2. 佈局重置 (+page@)

**使用場景**：特定頁面需要跳過某些佈局

````
src/routes/
├ (app)/
│ ├ item/
│ │ ├ [id]/
│ │ │ ├ embed/
│ │ │ │ └ +page@.svelte      ← 跳到根佈局
│ │ │ ├ share/
│ │ │ │ └ +page@(app).svelte  ← 跳到 app 佈局
│ │ │ └ +layout.svelte
│ │ └ +layout.svelte
│ └ +layout.svelte
└ +layout.svelte
````

**嵌入頁面範例**：

````svelte
<!-- 這個頁面跳過所有佈局，只使用根佈局 -->
<script>
    /** @type {import('./$types').PageData} */
    let { data } = $props();
</script>

<svelte:head>
    <title>嵌入 - {data.item.title}</title>
    <meta name="robots" content="noindex">
</svelte:head>

<!-- 純淨的嵌入介面 -->
<div class="embed-container">
    <div class="embed-header">
        <h1>{data.item.title}</h1>
        <a href="/item/{data.item.id}" target="_blank" class="view-full">
            查看完整版本 ↗
        </a>
    </div>
    
    <div class="embed-content">
        {@html data.item.content}
    </div>
    
    <div class="embed-footer">
        <small>由 我們的服務 提供支援</small>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: system-ui, sans-serif;
        background: #f9f9f9;
    }
    
    .embed-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
        background: white;
        min-height: 100vh;
    }
    
    .embed-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
        margin-bottom: 1rem;
    }
    
    .view-full {
        color: #007acc;
        text-decoration: none;
        font-size: 0.9rem;
    }
    
    .embed-footer {
        text-align: center;
        padding-top: 2rem;
        color: #666;
    }
</style>
````

### 3. 佈局重置 (+layout@)

**讓佈局本身跳過父佈局**：

````svelte
<!-- 這個佈局跳過 (app) 佈局，直接使用根佈局 -->
<script>
    import { page } from '$app/state';
    
    /** @type {import('./$types').LayoutData} */
    let { data, children } = $props();
</script>

<!-- 自定義的簡化佈局 -->
<div class="simplified-layout">
    <!-- 簡化的導航 -->
    <nav class="breadcrumb">
        <a href="/">首頁</a>
        <span>/</span>
        <a href="/items">項目列表</a>
        {#if page.params.id}
            <span>/</span>
            <span>{data.item?.title || '載入中...'}</span>
        {/if}
    </nav>
    
    <!-- 主要內容 -->
    <main class="content">
        {@render children()}
    </main>
</div>

<style>
    .simplified-layout {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }
    
    .breadcrumb {
        padding: 1rem 0;
        color: #666;
        font-size: 0.9rem;
    }
    
    .breadcrumb a {
        color: #007acc;
        text-decoration: none;
    }
    
    .content {
        margin-top: 1rem;
    }
</style>
````

### 4. 可重用佈局組件

**當不想使用羣組時的替代方案**：

````svelte
<script>
    /** @type {{
     *   data: any,
     *   title?: string,
     *   showSidebar?: boolean,
     *   sidebarContent?: import('svelte').Snippet,
     *   children: import('svelte').Snippet
     * }} */
    let { 
        data, 
        title = '預設標題',
        showSidebar = true,
        sidebarContent,
        children 
    } = $props();
</script>

<div class="reusable-layout" class:with-sidebar={showSidebar}>
    <!-- 標題列 -->
    <header class="layout-header">
        <h1>{title}</h1>
        {#if data.user}
            <div class="user-section">
                <img src={data.user.avatar} alt={data.user.name}>
                <span>{data.user.name}</span>
            </div>
        {/if}
    </header>
    
    <div class="layout-body">
        <!-- 可選的側邊欄 -->
        {#if showSidebar}
            <aside class="layout-sidebar">
                {#if sidebarContent}
                    {@render sidebarContent()}
                {:else}
                    <!-- 預設側邊欄內容 -->
                    <nav>
                        <a href="/dashboard">儀錶板</a>
                        <a href="/reports">報表</a>
                        <a href="/settings">設定</a>
                    </nav>
                {/if}
            </aside>
        {/if}
        
        <!-- 主要內容 -->
        <main class="layout-main">
            {@render children()}
        </main>
    </div>
</div>

<style>
    .reusable-layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    
    .layout-header {
        background: #f8f9fa;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #dee2e6;
    }
    
    .layout-body {
        flex: 1;
        display: flex;
    }
    
    .layout-sidebar {
        width: 250px;
        background: #f8f9fa;
        padding: 1rem;
        border-right: 1px solid #dee2e6;
    }
    
    .layout-main {
        flex: 1;
        padding: 2rem;
    }
    
    .with-sidebar .layout-main {
        margin-left: 0;
    }
</style>
````

**使用可重用佈局**：

````svelte
<script>
    import ReusableLayout from '$lib/ReusableLayout.svelte';
    
    /** @type {import('./$types').LayoutData} */
    let { data, children } = $props();
</script>

<ReusableLayout 
    {data} 
    title="特殊頁面區域"
    showSidebar={true}
>
    {#snippet sidebarContent()}
        <div class="special-sidebar">
            <h3>特殊功能</h3>
            <ul>
                <li><a href="/special/feature1">功能 1</a></li>
                <li><a href="/special/feature2">功能 2</a></li>
                <li><a href="/special/feature3">功能 3</a></li>
            </ul>
        </div>
    {/snippet}
    
    {@render children()}
</ReusableLayout>
````

### 5. 實際應用範例：多租户應用

````
src/routes/
├ (tenant)/           ← 租户應用
│ ├ [tenant]/
│ │ ├ dashboard/
│ │ ├ users/
│ │ ├ settings/
│ │ └ +layout.svelte
│ └ +layout.svelte
├ (admin)/            ← 系統管理
│ ├ tenants/
│ ├ billing/
│ ├ system/
│ └ +layout.svelte
├ (public)/           ← 公開頁面
│ ├ login/
│ ├ signup/
│ ├ pricing/
│ └ +layout.svelte
└ +layout.svelte      ← 根佈局
````

````svelte
<script>
    /** @type {import('./$types').LayoutData} */
    let { data, children } = $props();
</script>

<div class="tenant-app">
    <header class="tenant-header">
        <div class="tenant-brand">
            <img src={data.tenant.logo} alt={data.tenant.name}>
            <h1>{data.tenant.name}</h1>
        </div>
        <nav class="tenant-nav">
            <a href="/{data.tenant.slug}/dashboard">儀錶板</a>
            <a href="/{data.tenant.slug}/users">用户管理</a>
            <a href="/{data.tenant.slug}/settings">設定</a>
        </nav>
    </header>
    
    <main class="tenant-content">
        {@render children()}
    </main>
</div>
````

### 最佳實踐建議

1. **適度使用羣組**：不要為了使用而使用，保持結構清晰
2. **佈局重置謹慎使用**：主要用於特殊頁面（如嵌入、彈窗、列印版本）
3. **可重用組件**：當邏輯複雜時優於過度嵌套的羣組
4. **命名清晰**：羣組名稱要能清楚表達其用途
5. **漸進式採用**：從簡單開始，需要時再引入高級功能

高級佈局系統讓 SvelteKit 能夠處理複雜的應用架構，同時保持代碼的組織性和可維護性。
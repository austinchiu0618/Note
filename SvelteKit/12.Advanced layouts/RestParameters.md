## Rest parameters 剩餘參數

用於處理不確定數量的路由段。

### 核心概念

**問題場景**：當路由段的數量未知時，傳統的動態路由無法處理

````
// 傳統動態路由的限制
/files/[folder]/+page.svelte          ← 只能處理一層
/files/[folder]/[subfolder]/+page.svelte  ← 需要明確指定層級

// 但實際需求可能是：
/files/documents
/files/documents/2023
/files/documents/2023/reports
/files/documents/2023/reports/monthly
````

**解決方案**：使用剩餘參數 `[...paramName]`

### 1. 基本語法

#### 剩餘參數語法
**語法**：`[...paramName]`

````
src/routes/files/[...path]/+page.svelte
````

**匹配範例**：
- `/files/document.txt` → `path: "document.txt"`
- `/files/folder/subfolder/file.pdf` → `path: "folder/subfolder/file.pdf"`
- `/files/` → `path: ""`（空字符串）

### 2. 經典範例：GitHub 文件查看器

#### 路由結構
````
src/routes/[org]/[repo]/tree/[branch]/[...file]/+page.svelte
````

#### URL 解析範例
**URL**：`/sveltejs/kit/tree/main/documentation/docs/04-advanced-routing.md`

**解析結果**：
````javascript
{
  org: 'sveltejs',
  repo: 'kit', 
  branch: 'main',
  file: 'documentation/docs/04-advanced-routing.md'
}
````

#### 完整實現

````javascript
/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
    const { org, repo, branch, file } = params;
    
    // 驗證必要參數
    if (!org || !repo || !branch) {
        throw error(400, '缺少必要的存儲庫資訊');
    }
    
    try {
        // 獲取存儲庫資訊
        const repoInfo = await fetchRepoInfo(org, repo);
        
        // 處理檔案路徑
        if (!file) {
            // 顯示根目錄
            const contents = await fetchDirectoryContents(org, repo, branch, '');
            return {
                type: 'directory',
                path: '',
                contents,
                repoInfo,
                breadcrumbs: []
            };
        }
        
        // 檢查是檔案還是目錄
        const fileInfo = await fetchFileInfo(org, repo, branch, file);
        
        if (fileInfo.type === 'directory') {
            const contents = await fetchDirectoryContents(org, repo, branch, file);
            return {
                type: 'directory',
                path: file,
                contents,
                repoInfo,
                breadcrumbs: buildBreadcrumbs(file)
            };
        } else {
            const content = await fetchFileContent(org, repo, branch, file);
            return {
                type: 'file',
                path: file,
                content,
                fileInfo,
                repoInfo,
                breadcrumbs: buildBreadcrumbs(file)
            };
        }
    } catch (err) {
        throw error(404, '檔案或目錄未找到');
    }
}

function buildBreadcrumbs(filePath) {
    if (!filePath) return [];
    
    const segments = filePath.split('/');
    return segments.map((segment, index) => ({
        name: segment,
        path: segments.slice(0, index + 1).join('/')
    }));
}
````

````svelte
<script>
    import { page } from '$app/state';
    
    /** @type {import('./$types').PageData} */
    let { data } = $props();
    
    $: ({ org, repo, branch, file } = page.params);
</script>

<svelte:head>
    <title>{data.repoInfo.name} - {data.path || '(根目錄)'}</title>
</svelte:head>

<div class="file-browser">
    <!-- 存儲庫標題 -->
    <header class="repo-header">
        <h1>
            <a href="/{org}">{org}</a> /
            <a href="/{org}/{repo}">{repo}</a>
        </h1>
        <div class="branch-info">
            <span class="branch">分支：{branch}</span>
        </div>
    </header>
    
    <!-- 麵包屑導航 -->
    <nav class="breadcrumbs">
        <a href="/{org}/{repo}/tree/{branch}">根目錄</a>
        {#each data.breadcrumbs as crumb}
            <span>/</span>
            <a href="/{org}/{repo}/tree/{branch}/{crumb.path}">
                {crumb.name}
            </a>
        {/each}
    </nav>
    
    <!-- 內容區域 -->
    <main class="content">
        {#if data.type === 'directory'}
            <!-- 目錄檢視 -->
            <div class="directory-listing">
                <h2>目錄內容</h2>
                <ul class="file-list">
                    {#each data.contents as item}
                        <li class="file-item" class:is-directory={item.type === 'directory'}>
                            <a href="/{org}/{repo}/tree/{branch}/{data.path ? `${data.path}/` : ''}{item.name}">
                                <span class="icon">
                                    {item.type === 'directory' ? '📁' : '📄'}
                                </span>
                                <span class="name">{item.name}</span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {:else}
            <!-- 檔案檢視 -->
            <div class="file-viewer">
                <div class="file-header">
                    <h2>{data.fileInfo.name}</h2>
                    <div class="file-info">
                        <span>大小：{formatFileSize(data.fileInfo.size)}</span>
                        <span>修改時間：{formatDate(data.fileInfo.lastModified)}</span>
                    </div>
                </div>
                
                <div class="file-content">
                    {#if data.fileInfo.extension === 'md'}
                        <!-- Markdown 渲染 -->
                        <div class="markdown-content">
                            {@html renderMarkdown(data.content)}
                        </div>
                    {:else if isTextFile(data.fileInfo.extension)}
                        <!-- 代碼高亮 -->
                        <pre><code class="language-{data.fileInfo.extension}">{data.content}</code></pre>
                    {:else}
                        <!-- 二進制檔案 -->
                        <div class="binary-file">
                            <p>這是一個二進制檔案，無法直接顯示。</p>
                            <a href="/{org}/{repo}/raw/{branch}/{file}" download>下載檔案</a>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </main>
</div>

<style>
    .file-browser {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }
    
    .repo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
        margin-bottom: 1rem;
    }
    
    .breadcrumbs {
        padding: 0.5rem 0;
        color: #666;
        font-size: 0.9rem;
    }
    
    .breadcrumbs a {
        color: #007acc;
        text-decoration: none;
    }
    
    .file-list {
        list-style: none;
        padding: 0;
    }
    
    .file-item a {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        text-decoration: none;
        color: inherit;
        border-radius: 4px;
    }
    
    .file-item a:hover {
        background: #f8f9fa;
    }
    
    .icon {
        margin-right: 0.5rem;
    }
</style>
````

### 3. 重要特性：空參數匹配

#### 關鍵行為
**剩餘參數可以匹配零個段落**

````
src/routes/a/[...rest]/z/+page.svelte
````

**匹配的 URL**：
- `/a/z` → `rest: ""`（空字符串）
- `/a/b/z` → `rest: "b"`
- `/a/b/c/z` → `rest: "b/c"`

#### 驗證剩餘參數

````javascript
/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    const { path } = params;
    
    // 驗證路徑是否有效
    if (!isValidDocPath(path)) {
        throw error(404, '文檔路徑無效');
    }
    
    // 處理空路徑（首頁）
    if (!path) {
        return {
            type: 'index',
            title: '文檔首頁',
            sections: await loadDocSections()
        };
    }
    
    // 處理具體路徑
    const docContent = await loadDocContent(path);
    
    if (!docContent) {
        throw error(404, '文檔未找到');
    }
    
    return {
        type: 'document',
        content: docContent,
        path: path
    };
}

function isValidDocPath(path) {
    if (!path) return true; // 空路徑有效
    
    // 檢查路徑格式
    const validPattern = /^[a-z0-9\-\/]+$/;
    if (!validPattern.test(path)) return false;
    
    // 檢查危險路徑
    const dangerousPatterns = ['..', '//', '\\'];
    return !dangerousPatterns.some(pattern => path.includes(pattern));
}
````

### 4. 自定義 404 錯誤頁面

#### 問題場景
當訪問不存在的嵌套路由時，預設錯誤頁面可能不在正確的佈局中。

#### 錯誤的設置

````
src/routes/
├ marx-brothers/
│ ├ chico/
│ ├ harpo/
│ ├ groucho/
│ └ +error.svelte
└ +error.svelte
````

**問題**：訪問 `/marx-brothers/karl` 時，`marx-brothers/+error.svelte` 不會被渲染，因為沒有匹配的路由。

#### 正確的設置

````
src/routes/
├ marx-brothers/
│ ├ [...path]/
│ │ └ +page.js        ← 捕獲所有路徑並返回 404
│ ├ chico/
│ ├ harpo/
│ ├ groucho/
│ └ +error.svelte
└ +error.svelte
````

#### 實現自定義 404

````javascript
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    const { path } = params;
    
    // 檢查是否為有效的兄弟名稱
    const validBrothers = ['chico', 'harpo', 'groucho'];
    
    if (validBrothers.includes(path)) {
        // 這種情況應該被具體的路由處理，不應該到達這裡
        throw error(500, '路由配置錯誤');
    }
    
    // 返回 404 並提供有用的錯誤資訊
    throw error(404, {
        message: `"${path}" 不是馬克思兄弟的成員`,
        suggestions: validBrothers,
        searchQuery: path
    });
}
````

````svelte
<script>
    import { page } from '$app/state';
    
    $: error = page.error;
    $: ({ suggestions, searchQuery } = error || {});
</script>

<div class="error-page">
    <h1>糟糕！找不到這個兄弟</h1>
    <p>{error?.message || '頁面未找到'}</p>
    
    {#if suggestions}
        <div class="suggestions">
            <h2>您可能想找的是：</h2>
            <ul>
                {#each suggestions as brother}
                    <li>
                        <a href="/marx-brothers/{brother}">{brother}</a>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
    
    {#if searchQuery}
        <div class="search-info">
            <p>搜尋字詞："{searchQuery}"</p>
        </div>
    {/if}
    
    <div class="actions">
        <a href="/marx-brothers">回到兄弟列表</a>
        <a href="/">回到首頁</a>
    </div>
</div>
````

### 5. 實際應用範例

#### 檔案管理系統

````javascript
/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
    const { path } = params;
    const currentPath = path || '';
    
    // 安全檢查
    if (!isSecurePath(currentPath)) {
        throw error(403, '禁止訪問此路徑');
    }
    
    try {
        const fileSystemEntry = await getFileSystemEntry(currentPath);
        
        if (fileSystemEntry.type === 'directory') {
            const entries = await listDirectory(currentPath);
            const sorting = url.searchParams.get('sort') || 'name';
            const order = url.searchParams.get('order') || 'asc';
            
            return {
                type: 'directory',
                path: currentPath,
                entries: sortEntries(entries, sorting, order),
                breadcrumbs: buildBreadcrumbs(currentPath),
                canUpload: hasUploadPermission(currentPath)
            };
        } else {
            const fileData = await getFileData(currentPath);
            
            return {
                type: 'file',
                path: currentPath,
                fileData,
                breadcrumbs: buildBreadcrumbs(currentPath),
                canEdit: hasEditPermission(currentPath)
            };
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw error(404, '檔案或目錄未找到');
        }
        throw error(500, '無法訪問檔案系統');
    }
}

function isSecurePath(path) {
    // 防止路徑遍歷攻擊
    const dangerousPatterns = ['..', '~', '/etc', '/root'];
    return !dangerousPatterns.some(pattern => path.includes(pattern));
}
````

#### 多層級分類系統

````javascript
/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
    const { category } = params;
    const categoryPath = category || '';
    
    // 解析分類層級
    const categories = categoryPath ? categoryPath.split('/') : [];
    
    // 驗證分類路徑
    const validationResult = await validateCategoryPath(categories);
    if (!validationResult.isValid) {
        throw error(404, `無效的分類路徑：${validationResult.invalidSegment}`);
    }
    
    // 獲取當前分類資訊
    const currentCategory = await getCategoryInfo(categories);
    
    // 獲取子分類
    const subcategories = await getSubcategories(categories);
    
    // 獲取產品（如果是葉子分類）
    const products = currentCategory.isLeaf 
        ? await getProductsByCategory(categories, {
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '20'),
            sortBy: url.searchParams.get('sort') || 'name'
          })
        : [];
    
    return {
        categoryPath: categories,
        currentCategory,
        subcategories,
        products,
        breadcrumbs: buildCategoryBreadcrumbs(categories),
        isLeafCategory: currentCategory.isLeaf
    };
}
````

### 6. 路由優先級與衝突

#### 重要限制
**可選參數不能跟在剩餘參數後面**

````
// ❌ 錯誤：不會工作
src/routes/[...rest]/[[optional]]/+page.svelte

// 原因：剩餘參數是"貪婪"的，會匹配所有後續段落
````

#### 路由優先級範例

````
// 給定這些路由：
src/routes/files/images/+page.svelte           ← 最高優先級（靜態）
src/routes/files/[type]/+page.svelte          ← 中等優先級（動態）
src/routes/files/[...path]/+page.svelte       ← 最低優先級（剩餘）

// 對於 URL /files/images：
// 會匹配第一個路由，而不是剩餘參數路由
````

### 最佳實踐總結

1. **安全驗證**：總是驗證剩餘參數的值，防止路徑遍歷攻擊
2. **空值處理**：妥善處理空字符串的情況
3. **錯誤處理**：使用剩餘參數實現自定義 404 頁面
4. **路徑解析**：提供清晰的麵包屑導航
5. **性能考慮**：避免在剩餘參數路由中進行昂貴的操作
6. **類型安全**：配合 TypeScript 確保參數處理的安全性

剩餘參數是 SvelteKit 路由系統中處理動態、多層級路徑的強大工具，特別適合檔案系統、分類導航和內容管理系統。
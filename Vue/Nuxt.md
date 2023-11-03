## 建立專案
```bash
npx nuxi@latest init <project-name>
```

## 相關指令
### 啟動server的參數 
`--port`,` -p`
```bash
npm run dev -- -p 8080
```
以下相同(使用npx指令時)
```bash
npx nuxi dev -p 8080
```

### 當啟動server時，開啟瀏覽器並導向到開發的網址
`--open`,` -o`
```bash
npm run dev -- -o
```

### 清除自動產生的 Nuxt 檔案和快取, 刪除的目錄包含如下：
  - .nuxt
  - .output
  - dist
  - node_modules/.vite
  - node_modules/.cache
```bash
npx nuxi cleanup
```

## 使用 nuxi 快速建立模板檔案
指令
```
npx nuxi add <TEMPLATE> <NAME> [--cwd] [--force]
```
- TEMPLATE: 指定要產生的檔案模板類型，目前支援專案內常會使用到的 component、page 與伺服器 api 等。
- NAME: 填寫檔案名稱，也可以以路徑串接，來建立子資料夾中的檔案
- --cwd: 指定專案起始目錄，預設為 .。
- --force: 如果檔案存在，強制覆蓋檔案。

### Add page
```bash
# ./pages/about.vue
npx nuxi add page about

# ./pages/category/[id].vue
npx nuxi add page "category/[id]"
```

### Add composable
```bash
# ./composables/foo.ts
npx nuxi add composable foo
```

### Add layout
```bash
# ./layouts/custom.vue
npx nuxi add layout custom
```

### Add component

```bash
# ./components/TheHeader.vue
npx nuxi add component TheHeader
# or
npx nuxi add component TheHeader --mode "client|server"
```

.client.vue
```bash
# ./components/TheFooter.client.vue
npx nuxi add component TheFooter --client
# 等價
npx nuxi add component TheFooter --mode client
```

.server.vue
```bash
# ./components/TheFooter.server.vue
npx nuxi add component TheFooter --server
# 等價
npx nuxi add component TheFooter --mode server
```

### Add plugin
也可以添加修飾參數 
`--mode "client|server"`、`--client`、`--server。`
```bash
# ./plugins/analytics.ts
npx nuxi add plugin analytics
```

### Add middleware
```bash
# ./middleware/auth.ts
npx nuxi add middleware auth
```
添加修飾參數 `--global` 用以建立通用的全域路由中間件
```bash
# ./middleware/always-run.global.ts
npx nuxi add middleware always-run --global
```

### Add api
```bash
# ./server/api/hello.ts
npx nuxi add api hello
```
可以添加修飾參數`--method post`、`--method delete `...
```bash
# ./server/api/items.post.ts
npx nuxi add api items --method post
```



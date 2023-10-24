# lerna 基本使用
## 環境配置
```
npm install lerna -g
```

## 基本指令
* 初始化 lerna 項目
  ```
  lerna init
  ```
* 創建一個新的 package
  ```
  lerna create <name>
  ```
* 安裝所有 dependencies 並連接所有交叉的 dependencies
  ```
  lerna bootstrap
  ```
  可以先執行 lerna clean 先删除子項目的 node_modules , 然後再執行 lerna bootstrop
  ```
  lerna bootstrop --hoist
  ```
  --hoist 會將 packages 目錄下的公共模塊包抽離到最頂層，但是這種方式會有一個問題，不同版本號只會保留使用最多的版本，這種配置不太好，當項目中有些功能需要依賴老版本時，就會出現問題。

  ```
  yarn workspaces
  <!-- or -->
  yarn install
  ```
  解決 --hoist 不同的項目依賴不同的版本號問題， yarn   workspaces 會檢查每個子項目裡面依賴及其版本，如果版本不一致 都會保留到自己的 node_modules 中，只有依賴版本號一致的時 候才會提升到頂層。
  注意：這種需要在 lerna.json 中增加配置。
  ```json
  // lerna.json
  "npmClient": "yarn",
  "useWorkspaces": true
  ```
  ```json
  // package.json
  { 
    "workspaces":[
      "packages/*"
    ]
  }
  ```

* 增加套件到公共 node_modules
  ```
  lerna add axios
  ```
* 增加套件到指定 'package01'
  ```
  lerna add axios --scope=package01
  ```
* 清除 packages 下所有 node_modules
  ```
  lerna clean
  ```

## lerna 應用
1. 創建一個資料夾 monorepo 並 切換到 monorepo 
   ```
   mkdir monorepo
   cd monorepo
   lerna init
   ```
2. 建立共用項目資料夾
   ```
   lerna create common
   ```
   切換到packages資料夾，並執行 建立專案
   ```
   cd packages
   npm create vite@latest my-app --template vue-ts
   npm create vite@latest my-web --template vue-ts
   ```
   先删除每個專案的 node_modules 
   ```
   lerna clean
   ```
   設置 lerna.json
   ```json
   "npmClient": "yarn",
   "useWorkspaces": true
   ```
   設置 package.json
   ```json
   { 
     "workspaces":[
       "packages/*"
     ]
   }
   ```
   安裝依賴套件
   ```
   yarn install
   ```
   
3. 方便日後快速執行專案
   ```json
   "scripts": {
       "myapp": "lerna exec --scope myapp -- yarn dev",
       "myweb": "lerna exec --scope myweb -- yarn dev",
     }
   ```

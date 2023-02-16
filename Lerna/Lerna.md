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

  ```
  lerna bootstrop --hoist
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


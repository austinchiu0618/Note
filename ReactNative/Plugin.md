# Plugin

## babel-plugin-module-resolver

使用 Alias 解決 Import 超多”../“的問題

```code
npm install --save-dev babel-plugin-module-resolver
```

-  root: 指定路徑或根目錄
-  alias: 設定命名及對應的位置
-  extensions: 解析中使用的擴展數組，也就是覆蓋默認的擴展名

```js
{
  "plugins": [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        "root": ["./src"],
        "extensions": [".js",".jsx",".ios.js", ".android.js"],
        "alias": {
          "@src": "./src"
        }
      }
    ]
  ]
}
```

> 原來是"module-resolver"但是不成功,所以改成"require.resolve('babel-plugin-module-resolver')" 

## 備註：

套件安裝完

清除 npm cache

```code
npm start --reset-cache
```

重新 build

```code
npm run ios 
```



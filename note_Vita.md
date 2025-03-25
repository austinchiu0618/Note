## Vite Plugin

[Vite 的专属插件](https://github.com/vitejs/awesome-vite#plugins)

@vitejs/plugin-legacy: 为打包后的文件提供传统浏览器兼容性支持

## 錯誤提示：

找不到模組 ‘path’ 或其相對應的型別宣告 /找不到名稱"__dirname"

解決方式：
```
npm install @types/node --save-dev
```

## vant '@vant/touch-emulator' 與 videoJs衝突
加上 'data-no-touch-simulate'
```html
<video data-no-touch-simulate></video>
```

## 動態使用圖片
for vite vue
```js
let path = 'xxx.png'
new URL(`../assets/${path}`, import.meta.url).href
```
或是直接import圖片
```js
import xxx from '@/assets/xxx.png'
```

## vite .env
```js
import.meta.env.*
```
env.d.ts
```ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  // ...
}
```

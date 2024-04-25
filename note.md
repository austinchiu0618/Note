## 註解用
```js
/**
 * @params
 * 屬性 - 屬性說明....
 *
 * @event
 * 事件 - 事件說明....
 * 
 */
```

## window.open
非同步 請求資料後使用window.open 會有部分瀏覽器會出於安全原因阻止了window.open開啟新頁面。 
解決辦法：修改 非同步 為 同步 方法

## vant class
"truncate" 內建文字超出範圍後呈現'...'

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

## IOS
env() constant()
safe-area-inset-left：安全区域距离左边边界的距离
safe-area-inset-right：安全区域距离右边边界的距离
safe-area-inset-top：安全区域距离顶部边界的距离
safe-area-inset-bottom ：安全距离底部边界的距离

## :focus-visible
ex videoJS 在io14以下safari 點擊進度條會出現藍色框框
```css
.vjs-progress-holder:focus:not(.focus-visible) {
  outline: none;
}
```

## module is not defined, require is not defined
.eslintrc.js 添加以下内容
```js
module.exports = {
  env: {
    node: true
  }
}
```
或是使用註解忽略錯誤
```js
/* eslint-env node */
```

## Input Upload File
Input Event "change"
```js
function onChange (e){
  const file = event.target.files[0]

  // URL.createObjectURL
  const url = URL.createObjectURL(file);
  // url = blob:http...

  // 使用FileReader readAsDataURL方法來讀取圖片
  if (file) {
    const reader = new FileReader()
    reader.onload = function (e: ProgressEvent<FileReader>) {
      const txt = e.target?.result
      // <img src=txt />
    }
    reader.readAsDataURL(file)
  }
}
```
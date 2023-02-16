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
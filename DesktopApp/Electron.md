## Tailwind
postcss.config.js & tailwind.config.js 需改成*.cjs

並且將
```js
export default { } 
```
改成
```js
module.exports = { }
```

src/main：
- main.js : electron 的主程式 , 可在其中執行 & 使用 Node.js 函式 ( ex : fs.writefile )

src/preload：
- preload.js : 會在 index.html 中使用到的 JS 檔 , 常用於與 main.js 做 IPC 溝通

src/renderer：
- index.html : 顯示的 html 檔案 , 也是我們擺放貓咪圖片的地方

## main - index.ts
```ts
const mainWindow = new BrowserWindow({
  width: 800, // 寬度
  height: 600, // 高度
  x: 0, // 左方偏移量，預設置中
  y: 0, // 上方偏移量，預設置中
  useContentSize: false, // 設定窗口寬高是否包含框架與 Menu
  minWidth: 0, // 最小寬度
  minHeight: 0, // 最小高度
  maxWidth: 1000, // 最大寬度，預設無限制
  maxHeight: 1000, // 最大高度，預設無限制
  resizable: true, // 可否調整視窗大小
  movable: true, // 可否移動視窗
  minimizable: true, // 可否最小化
  maximizable: true, // 可否最大化
  closable: true, // 可否點擊關閉按鈕
  alwaysOnTop: false, // 視窗是否總是在頂部
  fullscreen: false, // 視窗是否全螢幕顯示
  fullscreenable: true, // 可否將視窗全螢幕
  Kiosk: false, // 視窗是否開啟 Kiosk 模式（Kiosk 模式是一種允許應用程式以全螢幕、無法退出的方式運作的模式）
  title: 'Electron', // 視窗標題
  icon: './images/icon.png', // 視窗框架圖示
  show: true, // 是否顯示視窗
  frame: false, // 是否隱藏框架 與 Menu
  parent: null, // 父視窗
  disableAutoHideCursor: false, // 視窗內是否隱藏鼠標
  autoHideMenuBar: false, // 是否隱藏 Menu（按下 Alt 可顯示）
  backgroundColor: '#FFF', // 背景顏色
  hasShadow: true, // 視窗是否有陰影
  opacity: 0, // 視窗初始不透明度
  darkTheme: false, // 視窗是否使用深色模式
  transparent: false, // 視窗是否透明（frame 為 true 才有作用）
  webPreferences: {
    devTools: true, // 是否開啟 devtools
    nodeIntegration: false, // 渲染進程是否可訪問 Node.js
    preload: path.join(__dirname, 'preload.js'), // preload.js 文件位置
    enableRemoteModule: false, // 是否啟用 remote 模塊
    zoomFactor: 1.0, // 窗口縮放係數
    webSecurity: true, // 是否開啟同源政策（關閉之後頁面才可以打 API）
    webgl: true, // 是否啟用 WebGL
    plugins: false, // 是否啟用插件
    experimentalFeatures: false, // 是否啟用 Chromium 實驗功能
    backgroundThrottling: true, // 是否在背景運行
  }
})
```
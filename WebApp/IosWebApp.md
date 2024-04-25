- 用戶將網頁收藏為書並加到主畫面時，可以令最下的選單消失，令網頁變為全屏幕，在 head 加入以下設定:
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
```

- 用戶將網頁收藏為書並加到主畫面時，可加入自定義的 icon，在 head 加入以下設定:
```html
<link rel="apple-touch-icon" href="/custom_icon.png"/>
```

- 用戶將網頁收藏為書並加到主畫面時，可以設定在載入網頁時的等待畫面，在 head 加入以下設定:
```html
<link rel="apple-touch-startup-image" href="/startup.png">
```

用戶將網頁收藏為書並加到主畫面時，可以將最上的狀態列設定為其他顏色(發覺只能設定為黑色)，在 head 加入以下設定:
```html
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
```

想在網頁載入完成時隱藏最頂的網址列，可加入以下的 Javascript:
```js
window.onload = function(){
    setTimeout(function(){
        window.scrollTo(0, 1);
    }, 100);
}
```

防止用戶拉動網頁，可加入以下的 Javascript:
```js
document.addEventListener("touchmove", function(event){
    event.preventDefault();
}, false);
```


```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="TDM">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="/src/assets/pwa/icon.png"/>
<link rel="apple-touch-startup-image" href="/src/assets/pwa/splash.png">
```
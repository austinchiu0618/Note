## manifest.json

```json
{
  "name": "DownLoader",
  "version": "1.0",
  "description": "DownLoader",
  "manifest_version": 3, //插件manifest版本
  "icons": {
    "128": "images/icon.png"
  },
  // 權限
  "permissions": [
    "activeTab",
    "scripting",
    "webNavigation",
    "storage",
  ],
  //域名权限
  "host_permissions": [ 
    "*://*/*"
  ],
  // content.js文件和它依赖的第三方库
  "content_scripts": [
    {
      "matches": [
        "https://chinaq.fun/*"
      ],
      "js": [
        "content_script/content.js"
      ]
    }
  ],
  //控制插件在浏览器在toolbar的显示
  "action":{
    "default_icon": "", //插件logo
    "default_title": "", //插件logo hover时的tooltip提示
    "default_popup": "popup.html" //插件本体页面
  },
  "background": {
    "service_worker": "background.js"
  }
}
```


## manifest.json

```json
{
  "name": "DownLoader",
  "version": "1.0",
  "description": "DownLoader",
  "manifest_version": 3,
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
  "action":{
    "default_popup": "popup/popup.html"
  },
  "background": {
    "service_worker": "background.js"
  }
}
```


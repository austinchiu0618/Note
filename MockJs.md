#

### 安裝
```
yarn add -D vite-plugin-mock mockjs
```

### 建立 mock 檔案
在 `mock/index.js`
```js
// mock/user.js
import Mock from 'mockjs'

export default [
  {
    url: '/api/user',
    method: 'get',
    response: ({url, query, body, headers}) => {
      return {
        code: 0,
        message: 'success',
        data: Mock.mock({
          'list|5': [{
            id: '@id',
            name: '@cname',
            age: '@integer(20, 30)'
          }]
        })
      }
    }
  }
]
```

修改 `vite.config.js`
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    vue(),
    viteMockServe({
      mockPath: 'mock',
      enable: true 
    })
  ]
})

```
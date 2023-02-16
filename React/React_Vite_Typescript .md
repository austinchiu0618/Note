# React + Vite + Typescript 

本文參考[Vite + React + Typescript 最佳实践](https://segmentfault.com/a/1190000039875183)

## 初始化项目

```
npm init @vitejs/app project-name --template react-ts
```

## 安装项目

### 基本

-  react & react-dom（基础核心）

```
npm install --save react react-dom
```

### 路由

-  react-router（必裝）

```
npm install react-router-dom@6
```

-  @loadable/component（动态路由加载）
-  react-router-config（更好的 react-router 路由配置包）

### 状态管理

-  redux
-  mobx-react & mobx-persist

## 資料夾配置

```js
.
├── app.tsx
├── assets // 静态资源，会被打包优化
│   ├── favicon.svg
│   └── logo.svg
├── common // 公共配置，比如统一请求封装，session 封装
│   ├── http-client
│   └── session
├── components // 全局组件，分业务组件或 UI 组件
│   ├── Toast
├── config // 配置文件目录
│   ├── index.ts
├── hooks // 自定义 hook
│   └── index.ts
├── layouts // 模板，不同的路由，可以配置不同的模板
│   └── index.tsx
├── lib // 通常这里放置第三方库，比如 jweixin.js、jsBridge.js
│   ├── README.md
│   ├── jsBridge.js
│   └── jweixin.js
├── pages // 页面存放位置
│   ├── components // 就近原则页面级别的组件
│   ├── home
├── routes // 路由配置
│   └── index.ts
├── store // 全局状态管理
│   ├── common.ts
│   ├── index.ts
│   └── session.ts
├── styles // 全局样式
│   ├── global.css
│   └── reset.css
└── utils // 工具方法
  └── index.ts
```

## 别名配置

- vite.config.ts
```js
{
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, './src'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/common': path.resolve(__dirname, './src/common'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/layouts': path.resolve(__dirname, './src/layouts'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store')
    }
  },
}
```

- tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/config/*": ["./src/config/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/common/*": ["./src/common/*"],
      "@/assets/*": ["./src/assets/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/routes/*": ["./src/routes/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/store/*": ["./src/store/*"]
    },
    "typeRoots": ["./typings/"]
  },
  "include": ["./src", "./typings", "./vite.config.ts"],
  "exclude": ["node_modules"]
}
```

## 路由规划(使用react-router-config、@loadable/component)

**React Router v6： 已經用 `useRoutes` 代替 react-router-config

- src/routes/index.ts

```ts
import loadable from '@loadable/component'
import Layout, { H5Layout } from '@/layouts'
import { RouteConfig } from 'react-router-config'
import Home from '@/pages/home'

const routesConfig: RouteConfig[] = [
  {
    path: '/',
    exact: true,
    component: Home
  },
  // hybird 路由
  {
    path: '/hybird',
    exact: true,
    component: Layout,
    routes: [
      {
        path: '/',
        exact: false,
        component: loadable(() => import('@/pages/hybird'))
      }
    ]
  },
  // H5 相关路由
  {
    path: '/h5',
    exact: false,
    component: H5Layout,
    routes: [
      {
        path: '/',
        exact: false,
        component: loadable(() => import('@/pages/h5'))
      }
    ]
  }
]

export default routesConfig
```

- main.tsx
  
```ts
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'
import routes from './routes'
import '@/styles/global.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>{renderRoutes(routes)}</BrowserRouter>
  </React.StrictMode>
)
```  
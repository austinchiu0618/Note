# Getting Started
## Install
```
yarn add --dev jest
```

＊ jest不支持esModule 需要安裝對應 babel 解析
```
yarn add --dev babel-jest @babel/core @babel/preset-env
```

＊ 加入TypeScript
```
yarn add --dev @babel/preset-typescript @types/jest
yarn add --dev ts-jest
```

## Config
```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  testMatch:[
    "**/?(*.)+(spec|test|unit).[jt]s?(x)" // 匹配单元测试文件
  ],
  transform: {
    "^.+\.[j|t]sx?$": "babel-jest",
    "^.+\.vue?$": "@vue/vue3-jest",
    "^.+\.tsx$": "ts-jest"
  }
}
```



```js
// babel.config.js
module.exports = {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
};

```
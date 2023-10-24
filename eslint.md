# eslint

```
npm install eslint --save-dev
yarn add -D eslint
```

```
npm run eslint --init
yarn eslint --init
 ```

1. 你想使用 ESLint 來做什麼？ 
  <br>選擇第二個：檢查語法、找出問題和強制執行編碼風格。
  <br>選擇第三個：檢查語法、找出問題和強制執行編碼風格(有 Airbnb、Google 等規範)。
2. 該專案是用什麼方式導入模組？
  <br>選擇第一個：使用 import/export，之後會需要配合 Babel 和 React。
3. 在專案裡用了哪個框架？
  <br> Vue / React，依照專案框架選擇。
4. 是否要使用 TypeScript
  <br> 依照專案選擇。
1. 想在哪個執行環境下使用？
  <br>選擇第一個：Browser 瀏覽器環境。
1. 該如何定義專案中的編碼風格？ (第1個問題選擇"3")
  <br>選擇第一個：依照目前流行的編碼規範。
1. 目前流行的有三個，請問選擇哪一種？ (第1個問題選擇"3")
  <br>三種都可以，不習慣的規則之後也能夠做例外處理。
1. 產生的 config 檔案要用哪種格式？
  <br>選擇習慣即可。

&emsp;

# .eslintrc 配置

rules中
- 第一個值是「錯誤層級（error level）」：
  - off 或 0 - 關閉規則
  - warn 或 1- 將該規則顯示為警告，但仍可執行
  - error 或 2 - 將規則顯示為錯誤，會跳出錯誤後不執行，無法成功編譯
- 第二個值則是針對該規則的「設定」，例如在 semi 規則中的 always 表示總是要有分號；quotes 規則中的 double 則表示要使用雙引號。

```js
module.exports = {
  // globals 欄位可以哪些變數是可以直接在檔案中使用的全域變數，
  /**
   * 設定 var1 和 var2 為全域變數
   * writable 表示該變數可以被重新定義該變數
   * readonly 則不能重新定義該變數
  **/
  globals: {
    "var1": "writable",
    "var2": "readonly"
  },
  extends: [
    "plugin:react/recommended",
    "plugin:import/recommended", // npm install eslint-plugin-import --save-dev
    
    // react
    "plugin:react-hooks/recommended" // npm install eslint-plugin-react-hooks --save-dev
  ], 
  plugins: [
    // ...
    "import", // eslint-plugin-import
    "react-hooks", // eslint-plugin-react-hooks
    "html" // eslint-plugin-html _ for error: parsing error expression expected.
  ],
  rules: {
    "semi": ["error", "never"], // 是否加分號
    "quotes": ["error", "double"], // 使用一致的反勾号、双引号 double 或 单引号 single
    "no-undef": "off", // 禁用未声明的变量
    "comma-dangle": ["error", "never"], // 要求或禁止使用拖尾逗号 
    "generator-star-spacing": "off", // allow async-await
    "arrow-parens": "off",  // 要求箭头函数的参数使用圆括号
    "one-var": "off", // 强制函数中的变量在一起声明或分开声明
    "prefer-promise-reject-errors": "off", // 要求使用 Error 对象作为 Promise 拒绝的原因
    "no-unused-vars": "warn", // 禁止未使用过的变量
    "no-console": "off", // 禁用 console
    "no-trailing-spaces": "error" // 禁用行尾空白
    "no-multiple-empty-lines": "error" // 禁止出现多行空行

    // plugin:import (eslint-plugin-import)
    "import/first": "off",
    "import/named": "error",
    "import/namespace": "error",
    "import/default": "error",
    "import/export": "error",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": "off",

    // react
    'react/react-in-jsx-scope': 'off',

    // plugin:react-hooks (eslint-plugin-react-hooks)
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"

  } 
}
```

&emsp;
# eslint相關套件

## Husky

```
npm install husky --save-dev
```

husky是可以很方便的在package.json配置git hook 脚本，例如在git commit前检测。

- .huskyrc.js (傑富專案做法，commit時會執行eslint)

```js
module.exports ={
  "hooks": {
    "pre-commit": "lint-staged"
  }
}
```

针对指定文件
```js
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --cache --fix",
      "git add"
    ],
    "src/**/*.{js,jsx}": [
      "eslint --cache --fix",
      "git add"
    ]
  }
  ```

## lint-staged

```
npm install lint-staged --save-dev
```

&emsp;
# 编辑器配置

## EditorConfig

项目根目录新建一个配置文件：.editorconfig

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```
## VS Code setting

在 vscode 编辑器中，Mac 快捷键 command + , 来快速打开配置项，切换到 workspace 模块，并点击右上角的 open settings json 按钮，配置如下信息：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.tslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

&emsp;

# ESLint + Prettier

1.  .eslintignore：配置 ESLint 忽略文件
2.  .eslintrc：ESLint 编码规则配置
   
> .eslintrc :: react 版本的配置
```js
{
  "settings": {
    "react": {
      "version": "detect" // 表示探测当前 node_modules 安装的 react 版本
    }
  }
}```
1.  .prettierignore：配置 Prettier 忽略文件
2.  .prettierrc：格式化自定义配置
```json
{
  "singleQuote": true,
  "tabWidth": 2,
  "bracketSpacing": true,
  "trailingComma": "none",
  "printWidth": 100,
  "semi": false,
  "overrides": [
    {
      "files": ".prettierrc",
      "options": { "parser": "typescript" }
    }
  ]
}
```

&emsp;
# 程式碼中備註
## 整支檔案隱藏警告

放在檔案開頭：

忽略所有規則​
```js
/* eslint-disable */ // 在該檔案關閉 ESLint
```

忽略特定規則
```js
/* eslint-disable [rule-name] */
/* eslint-disable no-alert, no-console
```
or
```js
/* eslint no-unused-vars: 0 */
/* eslint no-unused-vars: "error" */
```

## 特定行數隱藏警告

### 忽略單行

忽略所有規則​
```js
file = "I know what I am doing"; // eslint-disable-line

// eslint-disable-next-line
alert("foo");
```

忽略特定規則
```js
alert("foo"); // eslint-disable-line no-alert, quotes, semi

// eslint-disable-next-line no-alert
alert("foo");
```

### 忽略多行

忽略所有規則​
```js
/* eslint-disable */
alert("foo");
/* eslint-enable */
```

忽略特定規則
```js
/* eslint-disable no-alert, no-console */
alert("foo");
console.log("bar");
/* eslint-enable no-alert, no-console */
```
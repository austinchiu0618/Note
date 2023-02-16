# eslint

```
npm install eslint --save-dev
```

package.json
```js
"scripts": {
  "eslintInit": "eslint --init"
},
``` 

```
npm run eslintInit
 ```

1. 你想使用 ESLint 來做什麼？
<br>選擇第三個：檢查語法、找出問題和強制執行編碼風格。
1. 該專案是用什麼方式導入模組？
<br>選擇第一個：使用 import/export，之後會需要配合 Babel 和 React。
3. 在專案裡用了哪個框架？
<br> Vue / React
4. 想在哪個執行環境下使用？
<br>選擇第一個：Browser 瀏覽器環境。
5. 該如何定義專案中的編碼風格？
<br>選擇第一個：依照目前流行的編碼規範。
6. 目前流行的有三個，請問選擇哪一種？
<br>筆者習慣選擇 Airbnb，但其實三種都可以，不習慣的規則之後也能夠做例外處理。
7. 產生的 config 檔案要用哪種格式？
<br>一樣是筆者習慣，選擇 JavaScript，看起來比較順眼。

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



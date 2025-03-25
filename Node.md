## NVM
- 安裝node版本
```zsh
nvm install ‘版本號’
```

- 切換node版本
```zsh
nvm use ‘版本號’
```

- 查看已安裝了node版本(本機)
```zsh
nvm ls
```

## NPX
- 清除 npx 快取
```zsh
npx clear-npx-cache
```

# corepack
此功能目前為實驗階段
```zsh
# 啟動 corepack
corepack enable
```

- package.json
```json
{
  "packageManager": "yarn@1.22.15"
}
```

```zsh
#  声明的包管理器，会自动下载对应的 yarn，然后执行
yarn install

# 用非声明的包管理器，会自动拦截报错
pnpm install
Usage Error: This project is configured to use yarn
```



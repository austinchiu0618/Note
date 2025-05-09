# REST Client

### 第一步：從 Postman 導出請求
1. 打開 Postman，選擇你要發送的請求。
2. 點擊右上角的 Code 按鈕。
3. 在彈出的窗口中，選擇 cURL（或其他語言也可以）。
4. 複製生成的請求。

ex:
```
curl --location 'https://api.example.com' \
--header 'X-Site-Code: xxx' \
--header 'X-Abc-Signature: zxcvb' \
--header 'Content-Type: application/json' \
--data '{
    "aaa": "111",
    "bbb": "222",
    "ccc": "333"
}'
```

### 第二步：在 VSCode 創建 HTTP 文件
在 VSCode 中創建一個新文件，命名為 `request.http` 或直接 `.http`（文件擴展名必須是 `.http` 或 `.rest`）。

根據你的需求，使用參考下方格式填寫請求。
- GET
```
GET https://api.example.com/get
```
- POST
    
    ＊`Content-Type: application/json`後要空一行再填json
```http
POST https://api.example.com/post
X-Site-Code: xxx
X-Abc-Signature: zxcvb
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
    "aaa": "111",
    "bbb": "222",
    "ccc": "333"
}
```

### 第三步：發送請求
1. 打開 .http 文件。
2. 在請求行上方會出現 Send Request 按鈕，點擊它即可發送請求。

    ＊提示：如果沒看到按鈕，也可以按下 Ctrl + Shift + P（或 Cmd + Shift + P）搜索 "Rest Client: Send Request"，然後執行。

### 補充功能：
- 多请求支持：在同一个 .http 文件中可以写多个请求，用 ### 分隔。
```http
### 第一个请求
GET https://api.example.coma

### 第二个请求
POST https://api.example.com/b
Content-Type: application/json

{
    "aaa": "111",
    "bbb": "222",
    "ccc": "333"
}
```

- 可以使用 `{{变量}}` 语法，设置环境变量：
```
@baseUrl = https://api.example.com

GET {{baseUrl}}/user
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 遇到問題
- curl 後面有 --location
  
    可添加`@followRedirect = true`
```
@followRedirect = true
GET https://api.example.com
```

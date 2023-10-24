## 安裝
```zsh
brew install wget
```

## 基本下載檔案
### 下載檔案單一檔案
```zsh
wget http://ftp.xxx.xxx/xxx/xxx/wget-1.19.tar.gz

wget http://www.xxx.xxx/xxx/xxx/wget-1.19.tar.gz
```
### 下載檔案多個檔案
```zsh
wget http://www.xxx.xxx/xxx/xxx/wget-1.17.tar.gz  http://www.xxx.xxx/xxx/xxx/wget-1.18.tar.gz  http://www.xxx.xxx/xxx/xxx/wget-1.19.tar.gz
```

## 指定儲存的檔名
```zsh
wget -O wget.tar.gz http://ftp.gnu.org/gnu/wget/wget-1.19.tar.gz
```

## 從檔案中讀取網址
```
<!-- url.txt -->
http://ftp.gnu.org/gnu/wget/wget-1.18.tar.gz
http://ftp.gnu.org/gnu/wget/wget-1.18.tar.gz.sig
http://ftp.gnu.org/gnu/wget/wget-1.19.tar.gz
http://ftp.gnu.org/gnu/wget/wget-1.19.tar.gz.sig
```
```zsh
wget -i url.txt
```

## 偽裝瀏覽器
```zsh
wget --user-agent="Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko" https://www.xxx.com/xxx.png
```

## 下載整個網站
```zsh
wget --mirror -p --convert-links -P ./my_folder http://edition.cnn.com/
```
>這樣就會將 `http://edition.cnn.com/` 整個網站的內容全部下載下來，放在 `./my_folder` 目錄下。以下是這裡使用到的參數意義：

- `--mirror`：下載整個網站。
- `-p`：自動下載顯示網頁所需要的所有相關檔案。
- `--convert-links`：自動將下載網頁中的超連結，轉換為本地的連結。
- `-P ./my_folder`：將下載的檔案放在 `./my_folder` 目錄下。

## 遞迴下載特定類型檔案
>如果要從網站上下載特定類型的檔案，可以使用 -r 遞迴下載，並且配合 -A 指定下載的檔案類型，例如從網站上下載所有的 PDF 檔：
```zsh
wget -r -A.pdf http://www.example.com/
```

## 下載某路徑下資料夾
```zsh
wget -r -np -nH --cut-dirs=3 -R index.html http://hostname/aaa/bbb/ccc/ddd/
```
It will download all files and subfolders in ddd directory
- `-r` : recursively
- `-np` : not going to upper directories, like `ccc/…`
- `-nH` : not saving files to hostname folder
- `--cut-dirs=3` : but saving it to `ddd` by omitting first 3 folders `aaa`, `bbb`, `ccc`
- `-R index.html` : excluding `index.html` files
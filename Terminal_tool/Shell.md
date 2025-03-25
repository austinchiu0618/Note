### 常用指令
```zsh
# 重整 終端機
exec $SHELL

source ~/.zshrc
source ~/.zprofile
```

## set
本文取至 https://blog.csdn.net/cao0507/article/details/82697451
```
set [-參數] [-o 選項]
```
功能说明
set 指令可根据不同的需求来设置当前所使用 shell 的执行方式，同时也可以用来设置或显示 shell 变量的值。当指定某个单一的选项时将设置 shell 的常用特性，如果在选项后使用 -o 参数将打开特殊特性，若是 +o 将关闭相应的特殊特性。而不带任何参数的 set 指令将显示当前 shell 中的全部变量，且总是返回 true，除非遇到非法的选项。

### 参数说明
  
| 參數 | 說明 |
|-----|-----|
|  -a	| 标示已修改的变量，以供输出至环境变量 |
|  -b	| 使被中止的后台程序立刻回报执行状态 |
|  -d	| Shell预设会用杂凑表记忆使用过的指令，以加速指令的执行。使用-d参数可取消 |
|  -e	| 若指令传回值不等于0，则立即退出shell |
|  -f	| 取消使用通配符 |
|  -h	| 自动记录函数的所在位置 |
|  -k	| 指令所给的参数都会被视为此指令的环境变量 |
|  -l	| 记录for循环的变量名称 |
|  -m	| 使用监视模式 |
|  -n	| 测试模式，只读取指令，而不实际执行 |
|  -p	| 启动优先顺序模式 |
|  -P	| 启动-P参数后，执行指令时，会以实际的文件或目录来取代符号连接 |
|  -t	| 执行完随后的指令，即退出shell |
|  -u	| 当执行时使用到未定义过的变量，则显示错误信息 |
|  -v	| 显示shell所读取的输入值 |
|  -H | shell	可利用"!"加<指令编号>的方式来执行 history 中记录的指令 |
|  -x	| 执行指令后，会先显示该指令及所下的参数 |
|  +<参数> | 取消某个set曾启动的参数。与-<参数>相反 |
|  -o option | 特殊属性有很多，大部分与上面的可选参数功能相同，这里就不列了 |


# 解讀
```sh
#!/bin/bash

# echo color
BLUE="\033[94m" 
GREEN="\033[32m"
RED="\033[31m"
RESET="\033[0m" # 把之後的字恢復原狀

# set ENV
export $(grep -v '^#' .env.$APP_MODE.android | xargs)
APP_INFO="${BLUE}Melon $APP_MODE v$VITE_VERSION${RESET}"

# build Vue
echo -e "$APP_INFO ${GREEN}Building Vue...${RESET}"
yarn build --mode $APP_MODE.android --outDir src-cordova/www

# update config.xml
echo -e "$APP_INFO ${GREEN}Building Android App...${RESET}"
cd src-cordova
cp ./config.example.xml ./config.xml
sed -i "" "s/__APP_NAME__/$APP_NAME/" ./config.xml
sed -i "" "s/__APP_ID__/$APP_ID/" ./config.xml
sed -i "" "s/__APP_VERSION__/$VITE_VERSION/" ./config.xml

# building Android App
cordova platform remove android
cordova platform add android@10
cordova build android --release --buildConfig=build-$APP_MODE.json

# copy apk to dist
APP_OUTPUT_PATH=dist/melon-$APP_MODE-$VITE_VERSION.apk
cp platforms/android/app/build/outputs/apk/release/app-release.apk ../$APP_OUTPUT_PATH
echo -e "$APP_INFO ${GREEN}Built the following apk: ./$APP_OUTPUT_PATH${RESET}"
```

- `!/bin/bash` 是宣告，這份腳本的執行，請用 bash 的語言來解釋他，
- `RESET="\033[0m"` # 把之後的字恢復原狀
- `export` 设置或显示环境变量。
- `$(cmd)` 將小括號裡面的指令執行並返回
- `grep` 搜尋關鍵字, `-v`反向匹配
  - `grep -v '^#' .env.qa.android` 顯示不包含 以'#'開頭 的行
- `xargs` 這個指令會標準輸入（standard input）讀取資料，並以空白字元或換行作為分隔，將輸入的資料切割成多個字串，並將這些字串當成指定指令（預設為 /bin/echo）執行時的參數
  - `| xargs`
- `echo -e` 使用-e選項時，若字符串中出現以下字符，則特別加以處理，而不會將它當成一般文字輸出：
  - \a 發出警告聲；
  - \b 刪除前一個字符；
  - \c 最後不加上換行符號；
  - \f 換行但光標仍舊停留在原來的位置；
  - \n 換行且光標移至行首；
  - \r 光標移至行首，但不換行；
  - \t 插入tab；
  - \v 與\f相同；
  - \\ 插入\字符；
  - \nnn 插入nnn（八進制）所代表的ASCII字符；
- `yarn build`
  - `--mode xxx.yyy`  ==> 载入 .env.xxx.yyy
    ```
    .env                # 在所有的环境中被载入
    .env.local          # 在所有的环境中被载入，但会被 git 忽略
    .env.[mode]         # 只在指定的模式中被载入
    .env.[mode].local   # 只在指定的模式中被载入，但会被 git 忽略
    ```
  - `--outDir` build 後, 輸出的資料夾
- `sed` 依照脚本的指令来处理、编辑文本文件
  - `-i` 指的是 edit files in place 直接修改檔案的意思，如果不加上 `-i` 的話, `sed` 並不會修改該檔案，而是直接將修改後的結果列印出來。
  - p.s. 如果是 macOS 內建的 sed 指令，需在 -i 後加上 '' 才能正常執行，這是由於該 sed 指令版本與 Linux 上的版本不同，而 macOS 版本將 -i 改為必須為原檔提供備份檔案的檔名後綴，因此 -i '' 則是不備份的意思，如果用 -i .bak 的話，原本的檔案會被備份到 filename.bak 檔案中
  - `s/a/b/` 字串 a 取代為 b 的意思， a 的部分也接受正規表示式。

### 參考 
- [Bash Script 語法解析](https://medium.com/vswe/bash-shell-script-cheat-sheet-15ce3cb1b2c7)
- [Linux 匹配文字 grep 指令用法教學與範例](https://blog.gtwang.org/linux/linux-grep-command-tutorial-examples/)
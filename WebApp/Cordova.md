# Cordova

## Cordova CLI
```shell=
npm install -g cordova
```

## Create the App
在你的專案下，創建 cordova 
```shell=
cordova create [path] [id] [name]

# example
cordova create src-cordova com.first.app FirstApp
```
說明：
- path： 資料會產生在當前目錄下`src-cordova`資料夾
- id： APP 識別 ID；預設爲`io.cordova.hellocordova`
- name： APP 顯示名稱，會寫在`config.xml`的`name`；預設爲`HelloCordova`

:::info
將要打包的 HTML/CSS/JS 放置到 `www` 資料夾下
:::

## Add Platforms

再來的指令要在 cordova 的路徑下執行
```shell
cd src-cordova
```

加入 ios android 
```shell
cordova platform add ios
cordova platform add android
```

## 安裝 android 環境
Android Studio:
依照 Cordova 版本安裝 Android SDK 
1. SDK Platform
2. Android SDK Build-Tools
3. SDK Command-line Tools (latest)
4. Android SDK Platform-Tools
5. Android Emulator

`./zshrc`
```zsh
export ANDROID_HOME=~/Library/Android/sdk
export ANDROID_SDK_ROOT=~/Library/Android/sdk

export PATH=$PATH:$ANDROID_HOME/platform-tools/
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin/
export PATH=$PATH:$ANDROID_HOME/build-tools/
export PATH=$PATH:$ANDROID_HOME/emulator/
```  

## 打包前所需要的環境檢查
```shell
cordova requirements
```

執行後結果，如下：
(cordova-android@13.0.0 打包成功)
```shell
Requirements check results for android:
Java JDK: installed 17.0.14
Android SDK: installed true
Android target: installed android-34,android-33,android-30
Gradle: installed /opt/homebrew/Cellar/gradle/8.13/bin/gradle
java version "17.0.14" 2025-01-21 LTS
Java(TM) SE Runtime Environment (build 17.0.14+8-LTS-191)
Java HotSpot(TM) 64-Bit Server VM (build 17.0.14+8-LTS-191, mixed mode, sharing)
```

- [Android platform requirements](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#requirements-and-support)
- [iOS platform requirements](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html#requirements-and-support)

## Build the App

### 打包 debug 模式（自動簽名爲 debug）

- 打包所有平臺
```
cordova build
```

- 也可以指定打包的平臺
```
cordova build [ios|android]
```

### Android 打包 release 模式 (unsigned)
```shell=
cordova build [ios|android] --release -- --packageType=apk
```

### Android 打包 release 模式 ([signed](https://cordova.apache.org/docs/en/11.x/guide/platforms/android/index.html#signing-an-app))

-  透過指令帶參數
```shell=
cordova run android --release -- --keystore=../my-release-key.keystore --storePassword=password --alias=alias_name --password=password --packageType=bundle
```
- 使用 build.json

創建一個json檔案`src-cordova/build.json`
```json=
{
    "android": {
        "debug": {
            "keystore": "../android.keystore",
            "storePassword": "android",
            "alias": "mykey1",
            "password" : "password",
            "keystoreType": "",
            "packageType": "apk"
        },
        "release": {
            "keystore": "../android.keystore",
            "storePassword": "",
            "alias": "mykey2",
            "password" : "password",
            "keystoreType": "",
            "packageType": "bundle"
        }
    }
}
```
使用指令打包
```shell=
cordova run android --release
```
---

## 簽名

### 準備工具
1. keytool：生成數字證書，即密鑰
2. jarsigner：使用數字證書給apk文件簽名（只能簽 v1 = =）
3. [apksigner](https://developer.android.com/studio/command-line/apksigner?hl=zh-cn)： 可簽 v1, v2, v3, v4
4. zipalign：對簽名后的apk進行優化，提高與Android系統交互的效率

:::warning
對於以 Android 11（API 級別 30）為目標平台，且目前僅使用 APK 簽名方案 v1 簽名的應用，現在還必須使用 APK 簽名方案 v2 或更高版本進行簽名。用戶無法在搭載 Android 11 的設備上安裝或更新僅通過 APK 簽名方案 v1 簽名的應用。
:::

:::danger
注意：為支持運行舊版 Android 的設備，除了使用 APK 簽名方案 v2 或更高版本為您的 APK 簽名之外，您還應繼續使用 APK 簽名方案 v1 進行簽名。
:::

### 使用 keytool 工具生成數字證書
```shell
keytool -genkey -v -keystore xxx.keystore -alias xxx.keystore -keyalg RSA -validity 20000
```
說明：
- -genkey： 意味著執行的是生成數字證書操作
- -v： 表示將生成證書的詳細信息打印出來，顯示在dos窗口中
- -keystore： xxx.keystore 表示生成的數字證書的文件名為“xxx.keystore”
- -alias： xxx.keystore 表示證書的別名為“xxx.keystore”，當然可以不和上面的文件名一樣
- -keyalg： RSA 表示生成密鑰文件所采用的算法為RSA；
- -validity： 20000 表示該數字證書的有效期為20000天，意味著20000天之后該證書將失效

### 使用 jarsigner 簽名（只能簽 v1 = =）
```shell
jarsigner -verbose -keystore xxx.keystore -signedjar app_signed.apk app.apk xxx.keystore
```
說明
- -verbose： 表示將簽名過程中的詳細信息打印出來，顯示在dos窗口中
- -keystore xxx.keystore： 表示簽名所使用的數字證書所在位置
- -signedjar app_signed.apk app.apk： 給 app.apk 簽名，簽名後的文件名稱為 app_signed.apk
- xxx.keystore： alias 別名

#### 查看簽名訊息
```shell
jarsigner -verify -verbose -certs [檔案名]
```

### 使用 apksigner 簽名（簽 v1, v2, v3, v4）
```shell=
apksigner sign --ks ~/xxx.keystore --ks-key-alias xxx.keystore --out app-release-signed.apk app-release-unsigned.apk
```
說明
- --ks： 表示簽名所使用的數字證書所在位置
- --ks-key-alias： alias 別名
- -out app_signed.apk app.apk： 輸出名稱
- app-release-unsigned.apk： 要簽名的 apk

:::danger
注意：如果您在使用 apksigner 為 APK 簽名後又對 APK 做了更改，則 APK 的簽名將會失效。因此，要使用 zipalign 等工具，您必須在為 APK 簽名之前使用。
:::

#### 查看簽名訊息
```shell
apksigner verify --print-certs [檔案名]
```

### 使用 zipalign 壓縮已簽名的 apk
```shell
 zipalign -v 4 app_signed.apk app_signed_aligned.apk
```
說明
- -v： 印出詳細的優化信息
- app_signed.apk app_signed_aligned.apk： 表示對已簽名文件 app_signed.apk 進行優化，優化后的文件名為 app_signed_aligned.apk


#### 參考資料
[Android程序簽名詳解、打包、發布到Google play步驟](http://www.rocidea.com/one?id=23118)


## 更新Cordova時遇到問題
### Andorid

### IOS
- 出現白畫面

```xml
<preference name="scheme" value="app" />
<preference name="hostname" value="localhost" />
```

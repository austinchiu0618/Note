###
```java
System.out.println("");
```
## jenv JAVA管理套件
```zsh
# 查看已安裝的JDK目錄
/usr/libexec/java_home -V

# 加入 java 版本
jenv add /Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home

# 查看加到 jenv 的 JDK 版本
jenv versions

# 指定 JDK 版本 (global 不會覆蓋已經使用了 jenv local 指定了 JDK 版本的命令行窗口)
jenv local 1.8
jenv global oracle64-17.0.2

# 啟用匯出功能，允許 jEnv 自動設定 JAVA_HOME
jenv enable-plugin export
```
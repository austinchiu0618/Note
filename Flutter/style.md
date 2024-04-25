### TextButton
```dart
Widget buildTextButton() {
    return TextButton(
      child: Text("TextButton按钮"),
      // 添加一个点击事件
      onPressed: () {}, 
      // 设置按钮是否自动获取焦点
      autofocus: true, 
      // 定义一下文本样式
      style: ButtonStyle(
        // 定义文本的样式 这里设置的颜色是不起作用的
        textStyle: MaterialStateProperty.all(TextStyle(fontSize: 18, color: Colors.red)),
        // 设置按钮上字体与图标的颜色
        // foregroundColor: MaterialStateProperty.all(Colors.deepPurple),
        // 更优美的方式来设置
        foregroundColor: MaterialStateProperty.resolveWith(
          (states) {
            if (states.contains(MaterialState.focused) &&
                !states.contains(MaterialState.pressed)) {
              // 获取焦点时的颜色
              return Colors.blue;
            } else if (states.contains(MaterialState.pressed)) {
              // 按下时的颜色
              return Colors.deepPurple;
            }
            // 默认状态使用灰色
            return Colors.grey;
          },
        ),
        // 背景颜色
        backgroundColor: MaterialStateProperty.resolveWith((states) {
          // 设置按下时的背景颜色
          if (states.contains(MaterialState.pressed)) {
            return Colors.blue[200];
          }
          // 默认不使用背景颜色
          return null;
        }),
        // 设置水波纹颜色
        overlayColor: MaterialStateProperty.all(Colors.yellow),
        // 设置阴影  不适用于这里的TextButton
        elevation: MaterialStateProperty.all(0),
        // 设置按钮内边距
        padding: MaterialStateProperty.all(EdgeInsets.all(10)),
        // 设置按钮的大小
        minimumSize: MaterialStateProperty.all(Size(200, 100)),
        // 设置边框
        side: MaterialStateProperty.all(BorderSide(color: Colors.grey, width: 1)),
        // 外边框装饰 会覆盖 side 配置的样式
        shape: MaterialStateProperty.all(StadiumBorder()),
      ),
    );
  }
```

### TextField
```dart
TextField(
    // 键盘的样式
    keyboardType: TextInputType.text,
    // 监听
    controller: controller,
    // 最大长度
    maxLength: 30,
    // 最大行数
    maxLines: 1,
    //是否自动更正
    autocorrect: true,
    //是否自动化对焦
    autofocus: false,
    //是否是密码格式(输入的内容不可见)
    obscureText: false,
    // 文本对齐方式
    textAlign: TextAlign.start,
    // 输入文本的样式
    style: TextStyle(fontSize: 20, color: Colors.black),
    // 允许输入的格式(digitsOnly数字)
    inputFormatters: [WhitelistingTextInputFormatter.digitsOnly],
    // 内容改变回调
    onChanged: (account) {
      print("change $account");
    },
    // 提交触发回调
    onSubmitted: (account) {
      print("submit $account");
    },
    // 是否禁用
    enabled: true,
    decoration: InputDecoration(
        // 底色配合 filled: true 才有效
        fillColor: Colors.blue[50],
        filled: true,
        // 有聚焦,labelText就会缩小到输入框左上角,颜色primaryColor,没聚焦前颜色跟hintColor
        labelText: "账号",
        // 聚焦时才显示,颜色跟hintColor
        hintText: "请输入账号",
        // 红色
        // errorText: "输入错误",
        // 红色,现在在输入框的左下角,跟errorText位置一样(优先显示errorText)
        // helperText: "acount",
        // 输入框内左侧,有聚焦,颜色跟primaryColor
        prefixIcon: Icon(Icons.person),
        // 输入框左侧的widget&#xff08;可是text、icon……&#xff09;
        icon: Text(
          "账号:",
          style: TextStyle(fontSize: 20, color: Colors.black),
        ),
        // 输入框内右侧的widget
        suffixIcon: Icon(Icons.account_circle),
        // 有聚焦显示颜色跟hintColor,显示在输入框的右边
        suffixText: "后缀",
        contentPadding: EdgeInsets.all(5),
        border: OutlineInputBorder(
          //边框裁剪成11.11°角
          borderRadius: BorderRadius.circular(21.11), 
          //边框颜色、大小没有效果,所以使用返回的是Theme,
          borderSide: BorderSide( color: Colors.black, width: 25.0), 
          
        )),
),
```

### ThemeData
```dart
ThemeData({
  Brightness? brightness, //深色还是浅色
  MaterialColor? primarySwatch, //主题颜色样本，见下面介绍
  Color? primaryColor, //主色，决定导航栏颜色
  Color? cardColor, //卡片颜色
  Color? dividerColor, //分割线颜色
  ButtonThemeData buttonTheme, //按钮主题
  Color dialogBackgroundColor,//对话框背景颜色
  String fontFamily, //文字字体
  TextTheme textTheme,// 字体主题，包括标题、body等文字样式
  IconThemeData iconTheme, // Icon的默认样式
  TargetPlatform platform, //指定平台，应用特定平台控件风格
  ColorScheme? colorScheme,
  ...
})
```

```dart
BottomNavigationBar({
    super.key,
    required this.items,
    this.onTap,
    this.currentIndex = 0,
    this.elevation,
    this.type,
    Color? fixedColor,
    this.backgroundColor,
    this.iconSize = 24.0,
    Color? selectedItemColor,
    this.unselectedItemColor,
    this.selectedIconTheme,
    this.unselectedIconTheme,
    this.selectedFontSize = 14.0,
    this.unselectedFontSize = 12.0,
    this.selectedLabelStyle,
    this.unselectedLabelStyle,
    this.showSelectedLabels,
    this.showUnselectedLabels,
    this.mouseCursor,
    this.enableFeedback,
    this.landscapeLayout,
    this.useLegacyColorScheme = true,
  })
```
- key： 用于控制导航栏的 `GlobalKey`。如果导航栏在整个应用中是唯一的，可以使用 `UniqueKey`。
- items： 必须提供的一个 `List<BottomNavigationBarItem>`，每个 `BottomNavigationBarItem` 代表导航栏中的一个项目，包括图标、标题等。
- onTap： 一个回调函数，当用户点击导航栏中的任一项时触发。参数是被点击项的索引。
- currentIndex： 初始选中项的索引，默认为 `0`。使用这个属性可以控制哪个导航项在初始化时被选中。
- elevation： 表示导航栏的阴影效果，数值越大，阴影越明显。
- type： 导航栏的类型，可以是 `BottomNavigationBarType.fixed` 或 `BottomNavigationBarType.shifting`。如果不指定，默认值根据 items 的数量自动决定。
- fixedColor： 当 `type` 为 `BottomNavigationBarType.fixed` 时，用于设置未选中项的颜色。如果不设置，将使用主题中的颜色。
- backgroundColor： 导航栏的背景颜色。如果不设置，将使用主题中的背景颜色。
- iconSize: 导航项图标的大小，默认值为 `24.0`。
- selectedItemColor： 选中项的颜色。如果不设置，将使用主题中的颜色。
- unselectedItemColor： 未选中项的颜色。如果不设置，将使用主题中的颜色。
- selectedIconTheme： 选中项图标的主题，可以用来设置选中图标的亮度、大小等。
- unselectedIconTheme： 未选中项图标的主题，可以用来设置未选中图标的亮度、大小等。
- selectedFontSize： 选中项文本的字体大小，默认为 `14.0`。
- unselectedFontSize： 未选中项文本的字体大小，默认为 `12.0`。
- selectedLabelStyle： 选中项文本的样式，可以用来自定义字体、颜色等。
- unselectedLabelStyle： 未选中项文本的样式。
- showSelectedLabels： 是否显示选中项的文本标签，默认为 `true`。
- showUnselectedLabels： 是否显示未选中项的文本标签，默认为 `true`。
- mouseCursor： 鼠标悬停在导航项上时的光标样式。
- enableFeedback： 是否启用点击反馈。当设置为 `true` 时，点击导航项会有水波纹效果
- landscapeLayout： 横屏布局配置，可以是 `BottomNavigationBarLandscapeLayout.centered` 或 `BottomNavigationBarLandscapeLayout.behavior`。
- useLegacyColorScheme： 是否使用旧版的颜色方案。默认为 `true`。在某些情况下，如果你希望导航栏的颜色与旧版本的 Flutter 主题兼容，可以设置为 `true`。

### Custom Style
```dart
BottomNavigationBar(
  // 自定义选中项的颜色
  selectedItemColor: Colors.blue,
  
  // 自定义未选中项的颜色
  unselectedItemColor: Colors.grey,
  
  // 导航栏的背景颜色
  backgroundColor: Colors.white,
  
  // 导航栏的阴影大小
  elevation: 8,
  
  // 导航栏的形状，这里设置为圆角
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(20.0),
  ),
  
  // 自定义选中项的图标主题
  selectedIconTheme: IconThemeData(
    size: 30.0, // 选中图标大小
  ),
  
  // 自定义未选中项的图标主题
  unselectedIconTheme: IconThemeData(
    size: 25.0, // 未选中图标大小
  ),
  
  // 自定义选中项的文字样式
  selectedLabelStyle: TextStyle(
    fontSize: 14.0, // 选中文字大小
    fontWeight: FontWeight.bold, // 文字加粗
  ),
  
  // 自定义未选中项的文字样式
  unselectedLabelStyle: TextStyle(
    fontSize: 12.0, // 未选中文字大小
  ),
);
```
# React Navigation

## Getting started

v6.x

```
npm install @react-navigation/native
```

### Installing dependencies into a bare React Native project​

```
npm install react-native-screens react-native-safe-area-context
```

如果在项目中使用了Cocoapods（React Native 0.60及之后的版本创建时会自动使用），需要在启动前安装pods：

```
cd ios
npx pod install
```

```js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

const App = ()=> {
  return (
    <NavigationContainer>
        {/* your app code */}
    </NavigationContainer>
  );
}

export default App
```


### React Native Gesture Handler

替换React Native自带的手势处理系统

```
npm install react-native-gesture-handler
```

index.js 以及 App.js 檔案加入 react-native-gesture-handler （要在第一行）

```js
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```


### Creating a native stack navigator

```
npm install @react-navigation/native-stack
```

```js
import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
```

Stack.Navigator 列出基本常用的屬性，詳細的請[參考網址](https://reactnavigation.org/docs/stack-navigator/)

props

- initialRouteName<br>
  default 畫面名稱
- screenOptions<br>
  header default 畫面設定
- detachInactiveScreens(bool)<br>
  是否應將非活動畫面從視圖層次結構中分離以節省內存
- keyboardHandlingEnabled(bool)<br>
  鍵盤是否自動打開

screenOptions props

- headerTintColor
- headerTitleStyle
- headerMode
- headerShown(bool)

 Stack.Screens列出基本常用的，詳細的請[參考網址](https://reactnavigation.org/docs/stack-navigator/)

props

- name - 有點像頁面 id，Stack的名稱
- component - 對應的js檔
- options - 頁面 header 及一些選項設定

options props

- title - 頁面名字
- style - 客製自己的 header 除了高度
- headerStyle - 特別指定 header 的高度
- headerRight - header 左邊的客製化
- headerLeft - header 右邊的客製化
- leftButton - 左邊按鈕設定
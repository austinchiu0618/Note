### 
- Align:將組件對齊，由Alignment class指定對齊位置
```dart
Center(
  child: Container(
    height: 240,
    width: 240,
    color: Colors.amber[200],
    child: const Align(
      alignment: Alignment.topLeft,
      child: FlutterLogo(size: 60,),),
  ),
)
```

- AspectRatio:試圖讓組件呈現一定的比例，如16:9
```dart
AspectRatio(
  aspectRatio: 16 / 9,
  child: Container(
    color: Colors.green,
  ),
)
```

- Center:讓組件置中
 ```dart
Center(
  child: Container(color: Colors.green)
)
```

- ConstrainedBox: 對組件施加額外的限制，例如：最小高度50px
 ```dart
ConstrainedBox(
  constraints: const BoxConstraints(minHeight:50.0),
  child: const Card(child: Text('Hello World!')),
)
```

- Container:簡單的容器組件，可以在內部放任何東西並排版，類似HTML的<div>
 ```dart
Container(
  margin: const EdgeInsets.all(10.0),
  color: Colors.amber[600],
  width: 48.0,
  height: 48.0,
)
```

- Expanded:在與其他組件共享固定空間的同時，試圖擴展並填滿剩餘的空間
 ```dart
Column(
  children: <Widget>[
    Container(
      color: Colors.blue,
      height: 100,
      width: 100,
    ),
    Expanded(
    // 視剩下的空間有多少，盡可能填滿
      child: Container(
        color: Colors.amber,
        width: 100,
      ),
    ),
    Container(
      color: Colors.blue,
      height: 100,
      width: 100,
    ),
  ],
)
```

- Padding: 在組件加上padding（組件和外框的間隙）
  - padding: 
    - EdgeInsets.all(8.0):上下左右皆空出8.0
    - EdgeInsets.symmetric(vertical:8.0)：垂直方向空出8.0
    - EdgeInset.only(top:8.0):只在上方空出8.0
```dart
const Card(
  child: Padding(
    padding: EdgeInsets.all(16.0),
    child: Text('Hello World!'),
  ),
)
```

- SingleChildScrollView: 讓單一組件可以滑動。scrollview相關組件可以透過滑動讓頁面延伸，並得以放進更內容；通常搭配其他佈局元件使用。<br>
  - SingleChildScrollView內部先包了一層ConstrainedBox限制最小高度，ConstraintBox內層又包了Column用於垂直排列其他兩個Container children。就算在SingelChildScrollView內部塞入的組件總高度已經「超出螢幕高度」，仍然可以透過滾動捲軸查看完整畫面，不會有破版問題。
```dart
SingleChildScrollView(
    child: ConstrainedBox(
      constraints: BoxConstraints(
        minHeight: viewportConstraints.maxHeight,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: <Widget>[
          Container(
            // A fixed-height child.
            color: const Color(0xffeeee00), // Yellow
            height: 120.0,
            alignment: Alignment.center,
            child: const Text('Fixed Height Content'),
          ),
          Container(
            // Another fixed-height child.
            color: const Color(0xff008000), // Green
            height: 120.0,
            alignment: Alignment.center,
            child: const Text('Fixed Height Content'),
          ),
        ],
      ),
    ),
)
```

## 多個子組件的佈局組件

- Column：表示垂直方向的多個child widget佈局
  - mainAxisAlignment: 主軸(y軸)的對齊方式
    - center: 所有child垂直置中
    - start：所有child靠上方(主軸起始處)放置
    - end：所有child靠下方(主軸末端處)放置
    - spaceAround：所有child之間留相等的間距，第一個和最後一個child與邊界的距離是1/   - 2的間距
    - spaceBetween: 所有child之間留相等的間距，但第一個和最後一個child與邊界不留間    - 距
    - spaceEvenly: child和child之間、child和邊界之間的間距相等
  - crossAxisAlignment: 副軸(x軸)的對齊方式
    - center：所有child水平置中
    - start：所有child靠左方(副軸起始處)放置
    - end：所有child靠右方(副軸末端處)放置
    - stretch：延伸child使其填滿寬度
    - baseline: 所有child對齊baseline
```dart
Column(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: const <Widget>[
    Text('Deliver features faster'),
    Text('Craft beautiful UIs'),
    Expanded(
      child: FittedBox(
        child: FlutterLogo(),
      ),
    ),
  ],
)
```

- GridView：網格佈局，呈現2D維度的格子且包含捲軸
```dart
GridView.count(
  primary: false,
  padding: const EdgeInsets.all(20),
  crossAxisSpacing: 10,
  mainAxisSpacing: 10,
  crossAxisCount: 2,
  children: <Widget>[
    Container(
      padding: const EdgeInsets.all(8),
      color: Colors.teal[100],
      child: const Text("He'd have you all unravel at the"),
    ),
    Container(
      padding: const EdgeInsets.all(8),
      color: Colors.teal[200],
      child: const Text('Heed not the rabble'),
    ),
    Container(
      padding: const EdgeInsets.all(8),
      color: Colors.teal[300],
      child: const Text('Sound of screams but the'),
    ),
    Container(
      padding: const EdgeInsets.all(8),
      color: Colors.teal[400],
      child: const Text('Who scream'),
    ),
  ],
)
```  

- ListView：列表佈局，呈現垂直/水平的列表且包含捲軸
```dart
ListView(
  padding: const EdgeInsets.all(8),
  children: <Widget>[
    Container(
      height: 50,
      color: Colors.amber[600],
      child: const Center(child: Text('Entry A')),
    ),
    Container(
      height: 50,
      color: Colors.amber[500],
      child: const Center(child: Text('Entry B')),
    ),
    Container(
      height: 50,
      color: Colors.amber[100],
      child: const Center(child: Text('Entry C')),
    ),
  ],
)
```

- Row：表示水平方向的多個child widget的佈局，和Column相反
  - mainAxisAlignment: 主軸（x軸），properties同Column mainAxisAlignment
  - crossAxisAlignment: 副軸（y軸），properties同Column crossAxisAlignment
```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: const <Widget>[
    Expanded(
      child: Text('Deliver features faster', textAlign: TextAlign.center),
    ),
    Expanded(
      child: Text('Craft beautiful UIs', textAlign: TextAlign.center),
    ),
    Expanded(
      child: FittedBox(
        child: FlutterLogo(),
      ),
    ),
  ],
)
```

- Stack：堆疊佈局，設定組件的child相對於組件邊界的位置
  - 排序較後面的元件會在畫面上顯示在較為上層的位置
```dart
Stack(
  children: <Widget>[
    Container(
      width: 100,
      height: 100,
      color: Colors.red,
    ),
    Container(
      width: 90,
      height: 90,
      color: Colors.green,
    ),
    Container(
      width: 80,
      height: 80,
      color: Colors.blue,
    ),
  ],
)
```
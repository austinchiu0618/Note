# vue-waterfall-plugin 

[GITHUB 🌟504](https://github.com/heikaimu/vue3-waterfall-plugin)


```
yarn add vue-waterfall-plugin-next
```
### example
```vue
<script setup lang="ts">
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'

const list = ref([
  {
    // 圖片的key如果不是src，slot的url就會是undefined
    src: 'https://fakeimg.pl/165x280/', 
    xxx: 'xxx' 
  }
])
</script>

<template>
  <Waterfall :list="list">
    <template #default="{ item, url, index }">
      <div class="card">
        <LazyImg :url="url" />
        <p class="text">{{ item.xxx }}</p>
      </div>
    </template>
  </Waterfall>
</template>
```
## `Props` 参数
| 参数名              | 类型    | 默认值     | 描述                                                                               |
| ----------------- | ------- | ----------- | ----------------------------------------------------------------------------------------- |
| `list`              | `Array`   | []          | 列表数据 |
| `rowKey`           | `String`  | `id`          | 数据唯一的字段，比如列表里面的`id`, 如果要删除卡片，该字段为必填 |
| `imgSelector`       | `String`  | `src`         | 图片字段选择器，如果层级较深，使用 `xxx.xxx.xxx` 方式 |
| `width`             | `Number`  | `200`         | 卡片在 PC 上的宽度, 与breakpoints一样可以确定卡片的宽度以及每行个数, 但**breakpoints优先级高于width** |
| `breakpoints`       | `Object`  | {<br>1200:{rowPerView:3},<br>800:{rowPerView:2},<br>500:{rowPerView:1}<br>} | 类似css的@media, 定义不同容器宽度下每行卡片个数，主要用于对移动端的适配 |
| `gutter`            | `Number`  | `10`          | 卡片之间的间隙 |
| `hasAroundGutter`   | `Boolean` | `true`        | 容器四周是否有 `gutter` 边距 |
| `posDuration`       | `Number`  | `300`         | 卡片移动到正确位置的动画时间 |
| `animationPrefix`   | `String`  | `animate__animated` | 详情见下文《动画样式》 |
| `animationEffect`   | `String`  | `fadeIn`      | 卡片入场动画，默认只有 `fadeIn`，引入 `animation.css` 后可使用其他动画 |
| `animationDuration` | `Number`  | `1000`        | 卡片入场动画执行时间（单位毫秒）,该动画时间只影响卡片重拍的时间，一般情况都不用修改，如果想要修改飞入动画的执行时间，见下文|
| `animationDelay`    | `Number`  | `300`         | 卡片入场动画延迟（单位毫秒）|
| `animationCancel`   | `Boolean` | `false`       | 取消动画，开启后，所有动画属性都不生效 |
| `backgroundColor`   | `String`  | `#ffffff`     | 背景颜色 |
| `loadProps`         | `Object`  | `loadProps`   | 懒加载图片组件的属性设置，详情见下文《懒加载属性》 |
| `lazyload`          | `Boolean` | `true`        | 是否开启懒加载 |
| `crossOrigin`       | `Boolean` | `true`        | 图片加载是否开启跨域 |
| `delay`             | `Number`  | `300`         | 布局刷新的防抖时间，默认 `300ms` 内没有再次触发才刷新布局。（图片加载完成；容器大小、`list`、`width`、`gutter`、`hasAroundGutter`变化时均会触发刷新） |
| `align`             | `String` | `center`       | 卡片的对齐方式，可选值为：`left`,`center`,`right` |

## `WaterfallList` 方法
| 方法名字   | 返回值类型 | 描述 |
| --------- | --------- | -------------- |
| `afterRender` |        | 本次卡片坐标计算完成并且移动到了对应位置（列表渲染的过程可能会多次触发，比如有一张图片加载完成就会重新计算位置） |

## `LazyImg` 方法
| 方法名字   | 返回值类型 | 描述 |
| --------- | --------- | -------------- |
| `load`    | `string`  | img标签的load函数 |
| `success` | `string`  | 图片加载成功 |
| `error`   | `string`  | 图片加载失败 |

# v3-waterfall

[GITHUB 🌟140](https://github.com/gk-shi/v3-waterfall)

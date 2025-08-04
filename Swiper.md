### Vue3
```ts
import { Swiper, SwiperSlide } from 'swiper/vue'
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectFade,
  Thumbs,
  Scrollbar,
  FreeMode,
} from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const modules = [Autoplay, Navigation, Pagination]
```

```html
<template>
  <Swiper
    loop
    :slides-per-view="3"
    :space-between="20"
    :breakpoints="{
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }"
    :modules="modules"
    :autoplay="{
      disableOnInteraction: false, // 用户操作後仍然繼續自動播放
      delay: 3000
    }"
    :pagination="{
      clickable: true
    }"
    navigation>
    <SwiperSlide></SwiperSlide>
  </Swiper>
</template>
```

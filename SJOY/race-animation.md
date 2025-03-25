# 開獎動畫

[gitlab race-animation 連結 ](https://gitlab.com/jetfueltw/animation)

- 賽船：
  ```
  yarn add git+https://gitlab+deploy-token-79042:7dyach8Kyc5dx3PmUg5w@gitlab.com/jetfueltw/animation/race-boat-pixi-i#1.0.8
  ```

- 賽車：
  ```
  yarn add git+https://gitlab+deploy-token-78171:cDtWShh7CMQgDMRtSsBr@gitlab.com/jetfueltw/animation/race-car-pixi-i#1.0.8
  ```

- 賽狗：
  ```
  yarn add git+https://gitlab+deploy-token-79044:Z7DaHwbuuV-ajnSAfBZR@gitlab.com/jetfueltw/animation/race-dog-pixi-i#1.0.8
  ```

- 賽馬：
  ```
  yarn add git+https://gitlab+deploy-token-78175:wyoaEZyozMxRqqxx_YU2@gitlab.com/jetfueltw/animation/race-horse-pixi-i#1.0.8
  ```



## 相關套件
### vite-plugin-static-copy
vite進行打包時如何把某個靜態文件原封不動搬移
```
yarn add vite-plugin-static-copy@0.17.1 -D
```

`vite.config.ts`
```ts
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/race-xxx/assets',
          dest: 'statics/race-xxx/'
        },
      ]
    })
  ]
})
```

### url、path-browserify
安裝 url 解決
`warning`
Module "url" has been externalized for browser compatibility. Cannot access "url.resolve" in client code. See https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
`error`
Uncaught TypeError: _url2.default.resolve is not a function

安裝 path-browserify 解決
`error`
Uncaught TypeError: path.dirname is not a function

```
yarn add url path-browserify -D
```
`vite.config.ts`
```ts
export default defineConfig({
  resolve: {
    alias: {
      url: 'url',
      path: 'path-browserify'
    }
  }
})
```

## Component.vue

```vue
<script setup lang="ts">
import type raceDogGame from 'race-dog'
import type raceBoatGame from 'race-boat'
import type raceCarGame from 'race-car'
import type raceHorseGame from 'race-horse'

const props = withDefaults(defineProps<{
  currentIssue: number,
  nextIssue: number,
  results: number[],
  type: 'boat' | 'car' | 'dog' | 'horse'
}>(), {
  type: 'boat'
})

const animationEl = ref<HTMLDivElement>()
let animation: raceBoatGame | raceCarGame | raceDogGame | raceHorseGame | null
let isPlay = false
let lock = Promise.resolve()
const size = {
  width: 768,
  height: 548
}

const screenRaito = 548 / 768

const init = async () => {
  await (lock = lock.then(() => {
    console.log('currentType is', props.type)
    switch (props.type) {
      case 'boat':
        return import('race-boat')
      case 'car':
        return import('race-car')
      case 'dog':
        return import('race-dog')
      case 'horse':
        return import('race-horse')
    }
  }).then((game) => {
    if (!game) return
    const Game = game.default
    return new Promise(resolve => {
      animation = new Game(animationEl.value as HTMLDivElement, {
        width: size.width,
        height: size.height,
        assetRootSrc: `/statics/race-${props.type}/`,
        isMuteAll: true,
        background: 'default',
        preIssue: props.currentIssue,
        currIssue: props.nextIssue,
        preNum: [...props.results],
        onRunStart: onRunStart,
        onFinshGame: onFinished,
        onClose: async () => {
          await destroy()
          isShow.value = false
        },
        onReady: resolve
      })
    })
  })

  )
}

const onRunStart = async () => {
  isPlay = true
  await lock
  animation && animation.finishGame([...props.results])
}

const onFinished = () => {
  animation && animation.setIssue(props.nextIssue, props.currentIssue)
  animation && animation.setPreRank([...props.results])
  isPlay = false
}

// * 在開發環境時, 銷毀動畫（removeScene）會有銷毀不完全的問題，導致無法再建立動畫
const destroy = async () => {
  await lock
  try {
    if (!animation) return
    animation.removeScene()
    animation = null
  } catch (err) {
    console.error('error during destroy animation ', err)
  }
}

const updateSize = async () => {
  size.width = animationEl.value?.clientWidth ?? 768
  size.height = Math.floor(size.width * screenRaito)
  await lock
  animation && animation.rendererResize(size.width, size.height)
}

onMounted(() => {
  updateSize()
  init()
})

watch(() => props.nextIssue, (newVlaue, oldValue) => {
  if (newVlaue === oldValue || isPlay) return
  isPlay = true
  animation && animation.startCountdown(4)
})

useResizeObserver(animationEl, () => {
  updateSize()
})

</script>

<template>
    <div
      ref="animationEl"
      @click.stop>
    </div>
</template>

<style>
.container :deep(canvas) {
  width: 100%;
  height: 100%;
}
</style>
```
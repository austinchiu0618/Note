# Unocss

## Installation for Vite
```bash
yarn add -D unocss
npm install -D unocss
```
vite.config.ts
```ts
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [
    UnoCSS(),
  ],
})
```

uno.config.ts
```ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
})
```

main.ts
```ts
import 'virtual:uno.css'
```

## uno.config.ts
```ts
import { defineConfig,presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    // ...
  ],
  theme: {
    colors: {
      // ...
    },
    breakpoints: {
      // ...
    }
  },
})
```

## ESLint Config

用於排列class

```bash
yarn add -D @unocss/eslint-config
npm install -D @unocss/eslint-config
```

.eslintrc
```json
{
  "extends": [
    "@unocss"
  ]
}
```
Rules：
- @unocss/order - Enforce a specific order for class selectors.
- @unocss/order-attributify - Enforce a specific order for attributify selectors.



## Presets

- transformerDirectives

  UnoCSS transformer for @apply, @screen and theme()

  ```bash
  yarn add -D @unocss/transformer-directives
  npm install -D @unocss/transformer-directives
  ```

  ```ts
  import { defineConfig } from 'unocss'
  import transformerDirectives from '@unocss/transformer-directives'
  
  export default defineConfig({
    // ...
    transformers: [
      transformerDirectives()
    ],
  })
  ```

## Browser Style Reset

```bash
yarn add @unocss/reset
npm install @unocss/reset
```

main.ts
```ts
// normalize.css
import '@unocss/reset/normalize.css'

// Tailwind
import '@unocss/reset/tailwind.css'

// Tailwind compat
import '@unocss/reset/tailwind-compat.css'
```
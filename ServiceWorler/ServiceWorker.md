## Step 1
```js
// vite vue 
// const url = new URL('./serviceWorker.js', import.meta.url).href
navigator.serviceWorker.register('./serviceWorker.js')
  .then(reg => console.log('Registered Success!'))
  .catch(err => console.log('Register Error!', err))
```

## Step 2




self.addEventListener('install', event => {
  console.log('ServiceWorker Installing…')
  const CACHE_NAME = 'helloworld'
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('event.waitUntil')
        cache.addAll([
          './icon.png'
        ])
      })
      .catch(e => {
        console.log(e)
      })
  )
  // // cache a cat SVG
  // event.waitUntil(
  //   caches.open('static-v1').then(cache => cache.add('/cat.svg'))
  // )
})

self.addEventListener('activate', event => {
  console.log('ServiceWorker Activate')
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  console.log(url)
  // // serve the horse SVG from the cache if the request is
  // // same-origin and the path is '/dog.svg'
  // if (url.origin === location.origin && url.pathname === '/dog.svg') {
  //   event.respondWith(caches.match('/cat.svg'))
  // }
})

const CACHE_NAME = 'Rainy-v1'; // 悄悄加了个 -v1，以后如果你改了代码，把它改成 v2 就能强制手机更新啦！
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'  // 这里我帮你把注释去掉了，完美把图标也缓存进手机！
];

// 安装 Service Worker 并缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 拦截网络请求，优先使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到，直接返回缓存；否则发起网络请求
        return response || fetch(event.request);
      })
  );
});

// 更新缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

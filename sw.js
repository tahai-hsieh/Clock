const CACHE_NAME = 'tahai-clock-v3';

// 安裝時預先快取基本檔案
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// 啟用時清除舊快取
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 網路優先策略：有網路就抓最新版，沒網路才用快取
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // 網路正常，更新快取的檔案
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // 沒網路時才從快取抓取
                return caches.match(event.request);
            })
    );
});

var dataCacheName = 'tempus-v0.0.4';
var cacheName = 'tempus-0.0.4';
var filesToCache = [
	'index.html',
	'fonts/material-design-icons/material-icons.css',
	'fonts/material-design-icons/MaterialIcons-Regular.eot',
	'fonts/material-design-icons/MaterialIcons-Regular.ijmap',
	'fonts/material-design-icons/MaterialIcons-Regular.svg',
	'fonts/material-design-icons/MaterialIcons-Regular.ttf',
	'fonts/material-design-icons/MaterialIcons-Regular.woff',
	'fonts/material-design-icons/MaterialIcons-Regular.woff2',
	'fonts/roboto/Roboto-Bold.eot',
	'fonts/roboto/Roboto-Bold.ttf',
	'fonts/roboto/Roboto-Bold.woff',
	'fonts/roboto/Roboto-Bold.woff2',
	'fonts/roboto/Roboto-Light.eot',
	'fonts/roboto/Roboto-Light.ttf',
	'fonts/roboto/Roboto-Light.woff',
	'fonts/roboto/Roboto-Light.woff2',
	'fonts/roboto/Roboto-Medium.eot',
	'fonts/roboto/Roboto-Medium.ttf',
	'fonts/roboto/Roboto-Medium.woff',
	'fonts/roboto/Roboto-Medium.woff2',
	'fonts/roboto/Roboto-Regular.eot',
	'fonts/roboto/Roboto-Regular.ttf',
	'fonts/roboto/Roboto-Regular.woff',
	'fonts/roboto/Roboto-Regular.woff2',
	'fonts/roboto/Roboto-Thin.eot',
	'fonts/roboto/Roboto-Thin.ttf',
	'fonts/roboto/Roboto-Thin.woff',
	'fonts/roboto/Roboto-Thin.woff2',
	'js/crel.min.js',
	'js/jquery-1.12.0.min.js',
	'js/main.js',
	'js/materialize.min.js',
	'js/google_chart_loader.js',
	'css/main.css',
	'css/materialize.css',
	'css/materialize.min.css',
	'css/normalize.css'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'api.wunderground.com/api/';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});

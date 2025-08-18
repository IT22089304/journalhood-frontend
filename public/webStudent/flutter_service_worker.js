'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "4aa8aab85b7b1f5f56d7f7768dc90604",
"assets/AssetManifest.bin.json": "7c0928f5d33ca155a83f90efbc82c2f4",
"assets/AssetManifest.json": "0e82fa8976537f51906a5852bd1a1126",
"assets/assets/fonts/Poppins-Bold.ttf": "08c20a487911694291bd8c5de41315ad",
"assets/assets/fonts/Poppins-Italic.ttf": "c1034239929f4651cc17d09ed3a28c69",
"assets/assets/fonts/Poppins-Regular.ttf": "093ee89be9ede30383f39a899c485a82",
"assets/assets/fonts/Poppins-SemiBold.ttf": "6f1520d107205975713ba09df778f93f",
"assets/assets/images/app_icon.png": "4e3958b765f93fdcd416efd74eb618f7",
"assets/assets/images/app_icon_without_text.png": "aa5bb98e60fcde8b7873469eacf97bd1",
"assets/assets/images/app_icon_without_text.svg": "a605969955da6dde0c4c95b0f2d95813",
"assets/assets/images/app_icon_with_text.png": "db670e14c493fa2b15102aac4870b4db",
"assets/assets/images/app_icon_with_text.svg": "9a1d71808f0b20055de2e79fccd4b6d4",
"assets/assets/images/default_avatar.png": "e16b5684b5626d1ae5df4ea2b6c8933e",
"assets/assets/images/emotions/angry.png": "0279749b9112401b7deb6de9713007c9",
"assets/assets/images/emotions/anxious.png": "0c6a26368ae10f5d02644340c5d61bfc",
"assets/assets/images/emotions/confused.png": "6d093e876b960bb72be2c483bf1ec2f5",
"assets/assets/images/emotions/excited.png": "814e44119982f64973096217fd90cbd1",
"assets/assets/images/emotions/happy.png": "dcd9e775e91768275b7d1715b1335deb",
"assets/assets/images/emotions/lonely.png": "894c70724c1af12b6adcf7274a8d4303",
"assets/assets/images/emotion_ob.png": "20171523b33c912f6afbfd92f7906f41",
"assets/assets/images/loginImage.png": "a8855dbcdd108db5d3b863133abde397",
"assets/assets/images/security_ob.png": "5d2854d8a0432f5c3d6fe1960dcbfbfd",
"assets/assets/images/splash_screen_icon.png": "c2bb8ef11827badca9492be1ac8da35a",
"assets/assets/images/track_ob.png": "8191aebcf1cde555095a69ffc8d88b2c",
"assets/FontManifest.json": "1ca6cffd911816bd95911697edf63ac7",
"assets/fonts/MaterialIcons-Regular.otf": "0f1662e343793c16ad7e5d4e4b687c70",
"assets/NOTICES": "f39ae285aa5805160a64bb051acf96e6",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/quill_native_bridge_linux/assets/xclip": "d37b0dbbc8341839cde83d351f96279e",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "86e461cf471c1640fd2b461ece4589df",
"canvaskit/canvaskit.js.symbols": "68eb703b9a609baef8ee0e413b442f33",
"canvaskit/canvaskit.wasm": "efeeba7dcc952dae57870d4df3111fad",
"canvaskit/chromium/canvaskit.js": "34beda9f39eb7d992d46125ca868dc61",
"canvaskit/chromium/canvaskit.js.symbols": "5a23598a2a8efd18ec3b60de5d28af8f",
"canvaskit/chromium/canvaskit.wasm": "64a386c87532ae52ae041d18a32a3635",
"canvaskit/skwasm.js": "f2ad9363618c5f62e813740099a80e63",
"canvaskit/skwasm.js.symbols": "80806576fa1056b43dd6d0b445b4b6f7",
"canvaskit/skwasm.wasm": "f0dfd99007f989368db17c9abeed5a49",
"canvaskit/skwasm_st.js": "d1326ceef381ad382ab492ba5d96f04d",
"canvaskit/skwasm_st.js.symbols": "c7e7aac7cd8b612defd62b43e3050bdd",
"canvaskit/skwasm_st.wasm": "56c3973560dfcbf28ce47cebe40f3206",
"favicon.png": "586fa11d517e4eb82b3a3f4634b6854d",
"flutter.js": "76f08d47ff9f5715220992f993002504",
"flutter_bootstrap.js": "222d5e35a501e38a410f122693d10ba1",
"icons/Icon-192.png": "8a580eed36f10be9e2725f2c8b6795bb",
"icons/Icon-512.png": "ffb3f8c082c49ac680f2cddf06dc39d0",
"icons/Icon-maskable-192.png": "8a580eed36f10be9e2725f2c8b6795bb",
"icons/Icon-maskable-512.png": "ffb3f8c082c49ac680f2cddf06dc39d0",
"index.html": "18ecc6300c6edd35c93a837ab86b0eb3",
"/": "18ecc6300c6edd35c93a837ab86b0eb3",
"main.dart.js": "8b86424590fdcce55304bb8ab78f134d",
"manifest.json": "70d9b7a3a9739fd1c048e5bde18990b9",
"splash/img/dark-1x.png": "a55bd3386eb1fd89b7dac603f5360f2c",
"splash/img/dark-2x.png": "ed1cbbfc0b545eea5593966a594b1b7d",
"splash/img/dark-3x.png": "987a74e92ba7a1be3f464c1359a616f7",
"splash/img/dark-4x.png": "d34fd5a9e9650ad3a8084d40593fcfbf",
"splash/img/light-1x.png": "a55bd3386eb1fd89b7dac603f5360f2c",
"splash/img/light-2x.png": "ed1cbbfc0b545eea5593966a594b1b7d",
"splash/img/light-3x.png": "987a74e92ba7a1be3f464c1359a616f7",
"splash/img/light-4x.png": "d34fd5a9e9650ad3a8084d40593fcfbf",
"version.json": "a37c7c409ebd1fcbeaf85f7083496899"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}

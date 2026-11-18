// Momnie Family service worker: opens the app instantly from the phone's copy, and receives push notifications.
const VERSION = 'mf-v11.1';
const SHELL = ['./', 'index.html', 'manifest.json', 'config.js', 'fonts/caveat-latin.woff2', 'icons/icon-192.png', 'icons/apple-touch-icon.png', 'icons/chs-logo.png', 'icons/panda-cub-logo.png'];

importScripts('config.js');
if (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.apiKey) {
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
  firebase.initializeApp(self.FIREBASE_CONFIG);
  firebase.messaging(); // shows notifications sent with a "notification" payload and opens the app on tap
}

// cache: 'reload' skips the browser's own HTTP cache (GitHub Pages keeps files ~10 minutes), so a new version never saves an old page.
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });

// The app page itself: try the network first (fresh from GitHub, not the browser cache) so updates show on the next open.
// If the network is slow (over 2.5 s) or offline, the saved copy opens instead and the fresh one is saved for next time.
const isPage = (req, u) => req.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('/index.html');
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (isPage(e.request, u)) {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = (await c.match('./')) || (await c.match('index.html'));
      const fresh = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) c.put('./', r.clone()); return r; });
      if (!hit) return fresh;
      const slow = new Promise(res => setTimeout(() => res(null), 2500));
      try { const r = await Promise.race([fresh, slow]); if (r && r.ok) return r; } catch (err) {}
      e.waitUntil(fresh.catch(() => {}));
      return hit;
    }));
    return;
  }
  // Everything else (icons, fonts, config): show the saved copy right away, then fetch a fresh one for next time.
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(r => { if (r.ok) c.put(u.pathname.endsWith('/') ? './' : e.request, r.clone()); return r; }).catch(() => hit);
    if (hit) { e.waitUntil(fresh); return hit; }
    return fresh;
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const link = (e.notification.data && (e.notification.data.link || (e.notification.data.FCM_MSG && e.notification.data.FCM_MSG.fcmOptions && e.notification.data.FCM_MSG.fcmOptions.link))) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { const w = cs[0]; return w ? w.focus() : self.clients.openWindow(link); }));
});

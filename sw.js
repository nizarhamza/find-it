// Minimal offline app-shell cache for the installed app. The game itself is entirely
// client-side (single-player needs no network at all beyond the optional English dictionary
// lookup), so caching the shell is what lets it actually open and play with no connection.
//
// Bump the version suffix on CACHE whenever index.html changes meaningfully — that's what
// makes the next online visit pick up the update instead of serving the old cached shell
// forever (see the fetch handler below: navigations go network-first specifically so this
// isn't usually needed just to see a new deploy, but the cached copy itself still needs
// refreshing eventually).
const CACHE = "find-it-shell-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Cross-origin requests are the multiplayer Worker's HTTP/WebSocket API — that always needs
  // a live connection anyway, so leave those (and any non-GET) alone entirely.
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // The page itself: network-first, so an online visit always gets the latest deploy;
  // falls back to the cached shell only when the network is unreachable.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  // Everything else (icons, manifest, fonts if any get added later): cache-first, since it
  // rarely changes and there's no benefit to re-fetching it every load.
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
    )
  );
});

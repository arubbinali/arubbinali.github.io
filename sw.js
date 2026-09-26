const CACHE = "doaor-library-v3";
const CORE = [
  "/", "/manifest.json", "/logo.png",
  "/light/content/en/introduction/signs/muslim.md",
  "/light/content/en/introduction/signs/christian.md",
  "/light/content/en/introduction/signs/jew.md",
  "/light/content/en/introduction/signs/atheist.md",
  "/light/content/en/new-to-islaam/become-muslim.md",
  "/light/content/en/new-to-islaam/what-next.md",
  "/light/content/en/new-to-islaam/five-pillars.md",
  "/light/content/en/proofs/creator.md",
  "/light/content/en/proofs/quraan-word.md",
  "/light/content/en/refutations/aisha-six.md",
  "/light/content/en/refutations/isis-alqaeda.md",
  "/light/content/en/sources/sources.md",
  "/light/content/en/closed-heart/open-your-heart.md"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => { if (!response.ok) throw new Error(`Navigation ${response.status}`); const copy=response.clone();caches.open(CACHE).then((cache)=>cache.put(event.request,copy));return response; }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { if (response.ok) { const copy=response.clone();caches.open(CACHE).then((cache)=>cache.put(event.request,copy)); } return response; })));
});

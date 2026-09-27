// The build injects an immutable release ID and a complete list of its assets.
const RELEASE = "__RELEASE__";
const CORE = __CORE__;
const CACHE = "anatomy3d-v9-" + RELEASE;
const base = new URL("./", self.location.href);
const pageUrl = new URL("index.html", base).href;
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const existing = await caches.keys();
      try {
        const cache = await caches.open(CACHE);
        await cache.addAll(
          CORE.map(
            (path) => new Request(new URL(path, base), { cache: "reload" }),
          ),
        );
      } catch (error) {
        await caches.delete(CACHE);
        throw error;
      }
      // v8 is self-contained and has no update UI. Its next navigation loads v9.
      // Later modular releases wait for the learner to accept the update.
      if (
        existing.some((key) => key.startsWith("anatomy3d-v8")) &&
        !existing.some((key) => key.startsWith("anatomy3d-v9-"))
      )
        await self.skipWaiting();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE")
    event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Retain the preceding release so existing tabs can finish loading safely.
      const previous = keys
        .filter((key) => key.startsWith("anatomy3d-v9-") && key !== CACHE)
        .at(-1);
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("anatomy3d-") && key !== CACHE && key !== previous,
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== base.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (
        event.request.mode === "navigate" &&
        (url.pathname === base.pathname ||
          url.pathname === new URL("index.html", base).pathname)
      )
        return (await cache.match(pageUrl)) || fetch(event.request);
      const own = await cache.match(event.request);
      if (own) return own;
      if (url.pathname.startsWith(new URL("releases/", base).pathname)) {
        const prior = await caches.match(event.request);
        if (prior) return prior;
      }
      return fetch(event.request);
    })(),
  );
});

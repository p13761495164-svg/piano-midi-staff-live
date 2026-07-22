"use strict";

const CACHE_NAME = "easy-piano-v269";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=269",
  "./app.js?v=269",
  "./samples/trial-akatsuka-train.mid",
  "./samples/trial-seoul-subway-up.mid",
  "./manifest.webmanifest",
  "./icons/icon.png?v=244",
  "./icons/icon-192.png?v=244",
  "./icons/icon-512.png?v=244"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const isAppShell = event.request.mode === "navigate" ||
    requestUrl.pathname.endsWith("/index.html") ||
    requestUrl.pathname.endsWith("/app.js") ||
    requestUrl.pathname.endsWith("/styles.css") ||
    requestUrl.pathname.endsWith("/sw.js");
  if (isAppShell) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});

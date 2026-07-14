"use strict";

const CACHE_NAME = "easy-piano-v142";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=142",
  "./app.js?v=142",
  "./manifest.webmanifest",
  "./icons/icon.png?v=142",
  "./icons/icon-192.png?v=142",
  "./icons/icon-512.png?v=142"
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
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});

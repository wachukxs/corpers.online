var CACHE_NAME = 'corpers.online-cache-v1';
var urlsToCache = [
  'need/',
  'want/',
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

/*After a service worker is installed and the user navigates
to a different page or refreshes, the service worker will
begin to receive fetch events*/

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

/*Here we've defined our fetch event and within event.respondWith(),
we pass in a promise from caches.match(). This method looks at the
request and finds any cached results from any of the caches your
service worker created.

If we have a matching response, we return the cached value, otherwise
we return the result of a call to fetch, which will make a network
request and return the data if anything can be retrieved from the
 network.*/


 self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
      return;
  }

  const sendNotification = body => {
      // you could refresh a notification badge here with postMessage API
      const title = "Web Push example";

      return self.registration.showNotification(title, {
          body,
      });
  };

  if (event.data) {
      const message = event.data.text();
      event.waitUntil(sendNotification(message));
  }
});
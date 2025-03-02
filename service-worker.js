'use strict';


//********************      BASIC VANILLA SERVICE WORKER      ********************//


// import Workbox
self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');

// disable console logs
workbox.setConfig({ debug: false });   

// You must delete the following line if you are using lazy-loading of versioned, pre-cached assets
// or have other problems when updating the service worker. 
// Else, it is recommended to do skipWaiting.
// (skipWaiting: activate the new version of service worker now, instead of waiting for the next session to do so)
self.addEventListener('install', event => { self.skipWaiting() });

// notify when the new updated service worker (this file) gets activated
self.addEventListener('activate', event => { 
    // event.waitUntil( /* caching and other things to do before it is being installed */ );
    console.debug('service worker activated', event);
});


//********************               PRECACHING               ********************//

// precache things
workbox.precaching.precacheAndRoute([], 'GET');



//********************            CACHING STRATEGY            ********************//

// prefer cache for whatever ends in svg
workbox.routing.registerRoute(
    new RegExp('.*svg'),    
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'external-images'
      })      
);

// prefer internet on everything else (use cache only when offline)
workbox.routing.registerRoute(
    new RegExp('.*'),   // everything
    new workbox.strategies.NetworkFirst()     // Alternatively: StaleWhileRevalidate()
); 

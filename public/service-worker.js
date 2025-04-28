'use strict';



//********************      BASIC VANILLA SERVICE WORKER      //********************

// import Workbox
self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');

// disable console logs
workbox.setConfig({ debug: false });   

// skipWaiting: activate the new version of service worker now, instead of waiting for the next session to do so
self.addEventListener('install', event => { self.skipWaiting() });

// notify when the new updated service worker (this file) gets activated
self.addEventListener('activate', event => { 
    console.debug('service worker activated', event);
});



//********************            CACHING STRATEGY            //********************

/** Return the network response if it's fast, otherwise return the cached response.
 * @param {number} toleranceSeconds The number of seconds to wait before considering the network response slow.
 */
const networkWhenFast = (toleranceSeconds) => {
    return async ({ event }) => {
        const cache = await caches.open(workbox.core.cacheNames.runtime);
        const cachedResponse = await cache.match(event.request);    // ο αποθηκευμένος πόρος ή null

        const networkPromise = fetch(event.request)
            .then((response) => {   // Αν πετύχει η απάντηση
                cache.put(event.request, response.clone());   // Αποθηκεύει την απάντηση στην cache
                return response;    // Επιστρέφει την απάντηση
            })
            .catch(() => null); 
            // Αν το δίκτυο είναι εντελώς εκτός, το Promise να μην απορρίπτεται (δηλαδή να μην προκαλεί σφάλμα), αλλά αντίθετα να επιστρέφει null με επιτυχία (resolve)

        const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve(cachedResponse), toleranceSeconds * 1000)
        );  // Επιστρέφει την αποθηκευμένη απάντηση μετά από τόσα (toleranceSeconds) δευτερόλεπτα

        return Promise.race([networkPromise, timeoutPromise])   // Επιστρέφει την πιο γρήγορη απάντηση
            .then((response) => response || cachedResponse); 
            // Το response στο then είναι είτε το networkPromise (απάντηση internet ή null) είτε το timeoutPromise (αποθηκευμένος πόρος ή null)
    };
};


// on everything 
workbox.routing.registerRoute(
    new RegExp('.*'),
    new workbox.strategies.StaleWhileRevalidate(),
    // networkWhenFast(3),
); 
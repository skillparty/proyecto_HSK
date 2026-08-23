/**
 * idb-storage.js - Lightweight Promise-based IndexedDB key-value store
 * Used for persistent offline storage of SRS progress, stats and study history.
 */
(function () {
    const DB_NAME = "hsk_app_db";
    const DB_VERSION = 1;
    const STORE_NAME = "keyval";

    let dbPromise = null;

    function getDB() {
        if (!dbPromise) {
            dbPromise = new Promise((resolve, reject) => {
                if (typeof indexedDB === "undefined") {
                    reject(new Error("IndexedDB not supported in this environment"));
                    return;
                }

                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME);
                    }
                };

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
        return dbPromise;
    }

    const idbStorage = {
        async get(key) {
            try {
                const db = await getDB();
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, "readonly");
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.get(key);
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });
            } catch {
                return null;
            }
        },

        async set(key, val) {
            try {
                const db = await getDB();
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, "readwrite");
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.put(val, key);
                    req.onsuccess = () => resolve();
                    req.onerror = () => reject(req.error);
                });
            } catch {
                return false;
            }
        },

        async del(key) {
            try {
                const db = await getDB();
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, "readwrite");
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.delete(key);
                    req.onsuccess = () => resolve();
                    req.onerror = () => reject(req.error);
                });
            } catch {
                return false;
            }
        },
    };

    window.idbStorage = idbStorage;
})();

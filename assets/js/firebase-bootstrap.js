// Firebase modular bridge + HSKApp bootstrap.
// Loaded as a module; bare specifiers resolve via the inline <script type="importmap"> in index.html.
import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, serverTimestamp, increment, runTransaction } from 'firebase/firestore';

// Firebase Configuration (web apiKey is a public client identifier; access is enforced by firestore.rules)
const firebaseConfig = {
    apiKey: "AIzaSyA5IfoQH4pz7yPjVIV9jqUyQK5Hy9L9l-A",
    authDomain: "confuc10.firebaseapp.com",
    projectId: "confuc10",
    storageBucket: "confuc10.firebasestorage.app",
    messagingSenderId: "541754257691",
    appId: "1:541754257691:web:cc5e3524f3a92b6c8463be"
};

// Initialize Firebase immediately within the module
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Universal bridge to handle modular syntax for legacy scripts
window.FirebaseSDK = {
    initializeApp, getAuth, getFirestore, GithubAuthProvider, signInWithPopup, signOut,
    onAuthStateChanged, doc, getDoc, setDoc, updateDoc, collection, query, where,
    getDocs, orderBy, limit, serverTimestamp,
    increment, runTransaction  // atomic operations — required by updateProgress()
};

// Export instances to window for firebase-client.js
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;

console.log('🔥 Firebase Modular Bridge & Instances initialized');

// Robust bootstrap: wait until HSKApp is loaded before instantiation.
const initApp = () => {
    if (window.app) return true;
    if (typeof window.HSKApp === 'function') {
        console.log('🚀 Initializing HSKApp...');
        window.app = new window.HSKApp();
        return true;
    }
    return false;
};

const bootStartedAt = Date.now();
const bootTimeoutMs = 8000;

window.addEventListener('hsk:app-class-ready', () => initApp(), { once: true });

const bootInterval = setInterval(() => {
    if (initApp()) {
        clearInterval(bootInterval);
        return;
    }

    if (Date.now() - bootStartedAt > bootTimeoutMs) {
        clearInterval(bootInterval);
        console.error('❌ HSKApp class not found before bootstrap timeout.');
    }
}, 100);

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => initApp(), { once: true });
} else {
    initApp();
}

window.addEventListener('load', () => initApp(), { once: true });

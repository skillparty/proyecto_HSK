// Firebase Configuration for HSK Learning App
// This file contains the initialization for Firebase integration

const firebaseConfig = {
  apiKey: "AIzaSyA5IfoQH4pz7yPjVIV9jqUyQK5Hy9L9l-A",
  authDomain: "confuc10.firebaseapp.com",
  projectId: "confuc10",
  storageBucket: "confuc10.firebasestorage.app",
  messagingSenderId: "541754257691",
  appId: "1:541754257691:web:cc5e3524f3a92b6c8463be"
};

// Initialize Firebase
// Note: initializeApp is loaded from window.FirebaseSDK via index.html
if (window.FirebaseSDK) {
    const app = window.FirebaseSDK.initializeApp(firebaseConfig);
    const auth = window.FirebaseSDK.getAuth(app);
    const db = window.FirebaseSDK.getFirestore(app);

    // Export to window for access by other scripts
    window.firebaseApp = app;
    window.firebaseAuth = auth;
    window.firebaseDb = db;

    console.log('🔥 Firebase initialized successfully');
} else {
    console.error('❌ Firebase SDK not loaded');
}

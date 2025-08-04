import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyD_-nUEa1FNRhzZLBQ5mEGdpQK0fJqXvjc",
  authDomain: "kiku-a30c5.firebaseapp.com",
  projectId: "kiku-a30c5",
  storageBucket: "kiku-a30c5.firebasestorage.app",
  messagingSenderId: "340977619899",
  appId: "1:340977619899:web:8f042ef3c7a8f717a8ea9e",
  measurementId: "G-5JHB12WDTS"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  // Initialize Analytics
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Analytics failed to initialize:", error);
  }
}

export { analytics }

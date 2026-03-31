import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAzDehOvcxYD6LSW78bMiz0KJ5U1jQ2WLg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dfns-mpc-hedera.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dfns-mpc-hedera",
  storageBucket: "dfns-mpc-hedera.firebasestorage.app",
  messagingSenderId: "218849621324",
  appId: "1:218849621324:web:84fee40f24ed8e24f98be9",
  measurementId: "G-G1DPZNTXME"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

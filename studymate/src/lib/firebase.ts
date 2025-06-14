
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCTqsZC9g7ayjRK21AEQsevr41MeeeWRaQ",
  authDomain: "studymate-94228.firebaseapp.com",
  projectId: "studymate-94228",
  storageBucket: "studymate-94228.firebasestorage.app",
  messagingSenderId: "1069956494079",
  appId: "1:1069956494079:web:ccce24985485032977d2ca",
  measurementId: "G-L32PY7CXN0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Only initialize analytics if it's supported in the current environment
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => null);

export default app;

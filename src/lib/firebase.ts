import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLOTqlKBmvwYjnbDv0c91adOjQ6EJcZSM",
  authDomain: "vidyapeeth-ab155.firebaseapp.com",
  projectId: "vidyapeeth-ab155",
  storageBucket: "vidyapeeth-ab155.firebasestorage.app",
  messagingSenderId: "195901191854",
  appId: "1:195901191854:web:6d28a2390b3214775adf3f",
  measurementId: "G-XT7JDZ7EWG"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

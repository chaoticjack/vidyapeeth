const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Since we are in the project folder, we can read the env from .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'studentProgress'));
  console.log(`Found ${snap.size} studentProgress docs`);
  snap.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
  process.exit(0);
}
run().catch(console.error);

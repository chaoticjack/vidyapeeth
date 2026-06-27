import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching studentProgress...");
  const snap = await getDocs(collection(db, 'studentProgress'));
  console.log(`Found ${snap.size} docs in studentProgress.`);
  snap.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });

  console.log("Fetching enrollments...");
  const snapE = await getDocs(collection(db, 'enrollments'));
  console.log(`Found ${snapE.size} docs in enrollments.`);
  snapE.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
  
  process.exit(0);
}

run().catch(console.error);

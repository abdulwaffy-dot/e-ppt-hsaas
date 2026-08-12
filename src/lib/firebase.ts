import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAlo_mkXx8gp-7B9UrlLIb0KnL3pokgzyk",
  authDomain: "e-ppt-hsaas.firebaseapp.com",
  projectId: "e-ppt-hsaas",
  storageBucket: "e-ppt-hsaas.firebasestorage.app",
  messagingSenderId: "601316082203",
  appId: "1:601316082203:web:5afdf633653842f7b6eebe",
  measurementId: "G-SX3Z4P76KS"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const firestoreDatabaseId = "ai-studio-sistemeppthsaas-52b038c5-f4ae-446e-ab80-bb937d76aca8";

let dbInstance: ReturnType<typeof getFirestore>;

try {
  dbInstance = getFirestore(app, firestoreDatabaseId);
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);

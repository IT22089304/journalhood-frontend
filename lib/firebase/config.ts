import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7owqP2WFPynvDzd69HJP64IzrWJRirQQ",
  authDomain: "journalhood-4454f.firebaseapp.com",
  projectId: "journalhood-4454f",
  storageBucket: "journalhood-4454f.firebasestorage.app",
  messagingSenderId: "51958513218",
  appId: "1:51958513218:web:ae7c2e4186185aa5e037db",
  measurementId: "G-HGP85X8HM3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics and export it
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics }; 
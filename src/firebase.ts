import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with long-polling fallback for sandbox/iframe network resilience
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
    localCache: memoryLocalCache(),
  },
  (firebaseConfig as any).firestoreDatabaseId
);

// Initialize Auth
export const auth = getAuth(app);

export default app;


import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAAPVLKB3Vm05X8-DAAi9eId_101h7gtRg",
  authDomain: "ikshana-portal.firebaseapp.com",
  projectId: "ikshana-portal",
  storageBucket: "ikshana-portal.appspot.com",
  messagingSenderId: "791363800170",
  appId: "1:791363800170:web:YOUR_APP_ID" // You'll need to get this from Firebase console
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBqL_mgYjj8RYjYKUFNRNPMI4XUZz0-q2A",
  authDomain: "localwave-a8063.firebaseapp.com",
  projectId: "localwave-a8063",
  storageBucket: "localwave-a8063.appspot.com",
  messagingSenderId: "903824925180",
  appId: "1:903824925180:web:d8b8310d5d83d2a2fc1e0c"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

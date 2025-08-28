import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBhzyv9x2A7ROLvkuRJFadI813WvPBxUIk",
  authDomain: "firedrive-942d8.firebaseapp.com",
  projectId: "firedrive-942d8",
  storageBucket: "firedrive-942d8.appspot.com",
  messagingSenderId: "807747542451",
  appId: "1:807747542451:web:3fe48b94fef1f50b3bffc6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
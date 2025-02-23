import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXNsCSBzSDn6gJR0F7u2gBqDikhpK0Qao",
  authDomain: "sozsuzluk-main.firebaseapp.com",
  projectId: "sozsuzluk-main",
  storageBucket: "sozsuzluk-main.firebasestorage.app",
  messagingSenderId: "635165585534",
  appId: "1:635165585534:web:5edb03cc9e800573ab282f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
  }
}; 
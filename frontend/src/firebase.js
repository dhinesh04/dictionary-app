// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCNh8-EVJ-pa_tQqqtfV9-nH94gh09SoSo",
  authDomain: "dictionary-app-4645.firebaseapp.com",
  projectId: "dictionary-app-4645",
  storageBucket: "dictionary-app-4645.firebasestorage.app",
  messagingSenderId: "99339215362",
  appId: "1:99339215362:web:d84b24736d9127faaa3d1b"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };

// constants/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHiMCeiOFN-R4EoLTiBpeJWIUQYIrUA5M",
  authDomain: "beacon-haptic-sim.firebaseapp.com",
  projectId: "beacon-haptic-sim",
  storageBucket: "beacon-haptic-sim.appspot.com",
  messagingSenderId: "699174750938",
  appId: "1:699174750938:web:1ade40d8ef1a30c9c0b3e3",
  measurementId: "G-4QX9T79SL7",
};

// Next.js の HMR で多重初期化しないように
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

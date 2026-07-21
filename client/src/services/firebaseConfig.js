// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAQ2CxkQlq_k7ovEbpJDV4wg8ni8OpAQzQ",
  authDomain: "mentalhealthtracker-cc477.firebaseapp.com",
  projectId: "mentalhealthtracker-cc477",
  storageBucket: "mentalhealthtracker-cc477.appspot.com",
  messagingSenderId: "882564924649",
  appId: "1:882564924649:web:4599439f53337a3b3bdc78",
  measurementId: "G-JLFY38K6RG",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };

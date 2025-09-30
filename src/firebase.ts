// Import the functions you need from the SDKs you need 
import { FirebaseError, initializeApp } from "firebase/app"; 
// TODO: Add SDKs for Firebase products that you want to use 
// https://firebase.google.com/docs/web/setup#available-libraries 
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: `${process.env.NEXT_PUBLIC_FIREBASE_APIKEY}`,
  authDomain: "mytestapp-5dbf9.firebaseapp.com",
  projectId: "mytestapp-5dbf9",
  storageBucket: "mytestapp-5dbf9.appspot.com",
  messagingSenderId: "34451073992",
  appId: `${process.env.NEXT_PUBLIC_FIREBASE_APIID}`
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app); 
export {app, auth, db ,FirebaseError}; 
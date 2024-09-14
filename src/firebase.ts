// Import the functions you need from the SDKs you need 
import { FirebaseError, initializeApp } from "firebase/app"; 
// TODO: Add SDKs for Firebase products that you want to use 
// https://firebase.google.com/docs/web/setup#available-libraries 
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDWPTdLaa-2dkSVN03ly7QIpnPMjEtQknY",
  authDomain: "mytestapp-5dbf9.firebaseapp.com",
  projectId: "mytestapp-5dbf9",
  storageBucket: "mytestapp-5dbf9.appspot.com",
  messagingSenderId: "34451073992",
  appId: "1:34451073992:web:3a4b01cd683167ba8feefd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app); 
export {app, auth, db ,FirebaseError}; 
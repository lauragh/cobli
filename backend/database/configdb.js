//Wrapper
//Functions needed from firebase SDK to initialize database
const initializeApp = require('firebase/app').initializeApp;
//Add SDKs for the firebase products
const { getDatabase, ref, set, onValue, get, child, push, update} = require('firebase/database');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, sendPasswordResetEmail, on, FirebaseAuthException, browserSessionPersistence } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDJcRVGyKKsMiFKpAU1b0wDbkfOo3KOiRk",
  authDomain: "cobli-ee654.firebaseapp.com",
  databaseURL: "https://cobli-ee654-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cobli-ee654",
  storageBucket: "cobli-ee654.appspot.com",
  messagingSenderId: "971283430352",
  appId: "1:971283430352:web:e685aaf81c445593c297d5",
  measurementId: "G-375LR67HL9"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseApp);
const db = getDatabase();
const auth = getAuth();

module.exports = {
    firebaseApp,
    getDatabase,
    onValue,
    ref,
    set,
    get,
    child,
    push,
    update,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    sendPasswordResetEmail,
    on,
    FirebaseAuthException,
    browserSessionPersistence,
    auth,
    db
        // analytics,
}
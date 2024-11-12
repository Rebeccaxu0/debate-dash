// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, update } from "firebase/database"
import { useCallback, useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};


// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);
const auth = getAuth(firebase);

export { auth, database, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };

export const useDbData = (path) => {
    const [data, setData] = useState();
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!path) {
            return;
        }
        const dbRef = ref(database, path);
        const unsubscribe = onValue(dbRef, (snapshot) => {
            setData(snapshot.val());
        }, (error) => {
            setError(error);
        });

        return () => unsubscribe();
    }, [path]);

    return [data, error];
};

const makeResult = (error) => {
    const timestamp = Date.now();
    const message = error?.message || `Updated: ${new Date(timestamp).toLocaleString()}`;
    return { timestamp, error, message };
};

export const useDbUpdate = (path) => {
    const [result, setResult] = useState();

    const updateData = useCallback(async (value) => {
        // console.log('Updating path:', path);
        // console.log('Value before update:', value);

        if (!value || typeof value !== 'object') {
            console.error("Invalid value passed to updateData:", value);
            return;
        }

        const dbRef = ref(database, path);
        update(dbRef, value)
            .then(() => setResult(makeResult()))
            .catch((error) => {
                console.error("Error during Firebase update:", error);
                setResult(makeResult(error));
            });
    }, [path]);

    return [updateData, result];
};
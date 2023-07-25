import j from 'jscodeshift'
import { applyTransform, addDependency, addImports, addHooks, addComponent } from '../utils'
import { FileList } from "../types"

const ENV = `\
REACT_APP_FIREBASE_API_KEY=<YOUR_API_KEY>
REACT_APP_FIREBASE_AUTH_DOMAIN=<YOUR_AUTH_DOMAIN>
REACT_APP_FIREBASE_PROJECT_ID=<YOUR_PROJECT_ID>
`;

const FIREBASE = `\
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
`

const USE_AUTHENTICATION = `\
import { useState, useEffect } from 'react';
import firebase from './firebase';

const useAuthentication = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Add an observer for user authentication state changes
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup the observer on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        // User signed in successfully
        const user = result.user;
        setUser(user);
      })
      .catch((error) => {
        // Handle sign-in error
        console.error(error);
      });
  };

  const signOut = () => {
    firebase.auth().signOut()
      .then(() => {
        // User signed out successfully
        setUser(null);
      })
      .catch((error) => {
        // Handle sign-out error
        console.error(error);
      });
  };

  return { user, signInWithGoogle, signOut };
};

export default useAuthentication;
`

const IMPORTS = `
import useAuthentication from './utils/useAuthentication';
`

const HOOKS = `
const { user, signInWithGoogle, signOut } = useAuthentication();
`

const COMPONENT = `
{user ? (
  <div>
    <p>Welcome, {user.displayName}!</p>
    <button onClick={signOut}>Sign Out</button>
  </div>
) : (
  <div>
    <p>Please sign in to continue.</p>
    <button onClick={signInWithGoogle}>Sign In with Google</button>
  </div>
)}
`;

export const transformAppFile = (root: j.Collection) => {

  addImports(root, IMPORTS)
  addHooks(root, HOOKS)
  addComponent(root, COMPONENT)

  return root;
};

export default (files: FileList) => {
  let transformedFiles: FileList = {};
  transformedFiles["/.env"] = files["/.env"] ? files["/.env"] + "\n" + ENV : ENV;
  if (files["/App.js"]) {
    transformedFiles["/App.js"] = applyTransform(files["/App.js"], transformAppFile);
  }
  if (files["/package.json"]) {
    transformedFiles["/package.json"] = addDependency(files["/package.json"], "firebase", "*")
  }
  transformedFiles["/utils/firebase.js"] = FIREBASE;
  transformedFiles["/utils/useAuthentication.js"] = USE_AUTHENTICATION;
  return transformedFiles;
}

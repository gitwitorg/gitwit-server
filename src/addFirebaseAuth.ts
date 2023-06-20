import j from 'jscodeshift'
import { applyTransform, addDependency } from './utils'
import { FileList } from "./types"

const FIREBASE = `\
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: '<YOUR_API_KEY>',
  authDomain: '<YOUR_AUTH_DOMAIN>',
  projectId: '<YOUR_PROJECT_ID>',
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
import React from 'react';
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

  // Find existing imports
  const importDeclaration = root.find(j.ImportDeclaration);
  // Insert the imports after the last existing import
  if (importDeclaration.length) {
    importDeclaration.at(-1).insertAfter(IMPORTS);
  }
  // Add the imports to the beginnning of the file
  else {
    root.find(j.Program).get('body', 0).insertBefore(IMPORTS);
  }

  // Find the default export
  const appExport = root.find(j.ExportDefaultDeclaration);
  const returnStament = appExport.find(j.ReturnStatement);

  // Insert the hooks before the return statement
  returnStament.at(0).insertBefore(HOOKS);

  // Insert the new component add the end of the first JSX element
  returnStament.find(j.JSXElement).at(0)
    .childNodes().at(-1)
    .insertAfter(COMPONENT);

  return root;
};

export default (files: FileList) => {
  let transformedFiles: FileList = {};
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
// Wrapper for various things that use firebase.
// This file should NOT import firebase/auth as a module but may import it, once, using a function call (as a code split)
// Note, currently using the "compat" version of firebase v9, which doesn't support treeshaking. No reason, just a TODO to upgrade to full v9 API.
// See https://firebase.google.com/docs/web/modular-upgrade
import firebase from "firebase/compat/app";
import { connectParseServer } from "../connection/ParseServerConnection";
import { getCookie } from "../Utilities";

const firebaseConfig = {
    apiKey: "AIzaSyACJ7fi7_Rg_bFgTIacZef6OQckr6QKoTY",
    authDomain: "sil-bloomlibrary.firebaseapp.com",
    databaseURL: "https://sil-bloomlibrary.firebaseio.com",
    projectId: "sil-bloomlibrary",
    storageBucket: "sil-bloomlibrary.appspot.com",
    messagingSenderId: "481016061476",
    appId: "1:481016061476:web:8c9905ffec02e8579b82b1",
};

// This promise is the result of calling the async function getFirebaseAuthInternal().
// That must only be called once; so in case getFirebaseAuth() is called repeatedly,
// the first call instantiates the promise which they all wait for.
let firebasePromise: Promise<any> | undefined;
// Stores functions passed to firebaseAuthStateChanged before firebase is sufficiently
// initialized to pass them to firebase.auth().onAuthStateChanged().
const authStateChangedFunctions: (() => void)[] = [];

// Call this from the root component at startup. IFF a user is logged in, it starts up firebase
// so that we can use it to get the logged-in user.
export async function initializeFirebase() {
    const loggedIn = getCookie("loggedIn");
    if (loggedIn === "true") {
        await getFirebaseAuth();
    }
    // otherwise we deliberately don't initialize firebase until the user logs in,
    // avoiding fetchng and loading a big chunk of code.
}

// When (and if) firebase is started up, register this function as an onAuthStateChanged callback.
export function firebaseAuthStateChanged(f: () => void) {
    if (firebasePromise) {
        firebasePromise.then(() => firebase.auth().onAuthStateChanged(f));
    } else {
        authStateChangedFunctions.push(f);
    }
}

// Must not use firebase.auth (it may be undefined, or firebase may not be otherwise initialized)
// until this result is awaited.
export async function getFirebaseAuth() {
    if (!firebasePromise) {
        firebasePromise = getFirebaseAuthInternal();
    }
    await firebasePromise;
    return firebase.auth;
}

// Get the current user if there is one. Avoids loading Firebase code chunk if there isn't.
export async function getCurrentUser() {
    // This local cookie is set iff someone is logged in. If no one is, we can avoid loading
    // the firebase code, which is huge.
    const loggedIn = getCookie("loggedIn");
    if (loggedIn === "true") {
        await getFirebaseAuth();
        return firebase.auth().currentUser;
    }
    return null;
}

// Call this only once! Firebase complains if it is repeatedly imported or initialized.
async function getFirebaseAuthInternal() {
    // This has the vital side effect of initializing firebase.auth to the appropriate object.
    // Note, currently using the "compat" version of firebase v9, which doesn't support treeshaking. No reason, just a TODO to upgrade to full v9 API.
    // See https://firebase.google.com/docs/web/modular-upgrade
    await import(/* webpackChunkName: "firebase" */ "firebase/compat/auth");

    firebase.initializeApp(firebaseConfig);

    firebase.auth().onAuthStateChanged(() => {
        const user = firebase.auth().currentUser;
        if (!user || !user.emailVerified || !user.email) {
            return;
        }
        user.getIdToken().then((idToken: string) => {
            connectParseServer(idToken, user.email!)
                // .then(result =>
                //     console.log("ConnectParseServer resolved with " + result)
                // )
                .catch((err) => {
                    console.log(
                        "*** Signing out of firebase because of an error connecting to ParseServer"
                    );
                    firebase.auth().signOut();
                });
        });
    });

    authStateChangedFunctions.forEach((f) =>
        firebase.auth().onAuthStateChanged(f)
    );

    return firebase.auth;
}

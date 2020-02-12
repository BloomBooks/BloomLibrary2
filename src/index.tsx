import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

// these two firebase imports are strange, but not an error. See https://github.com/firebase/firebase-js-sdk/issues/1832
import firebase from "firebase/app";
import "firebase/auth";

//import * as firebaseui from "firebaseui";
import { connectParseServer } from "./connection/ParseServerConnection";

const firebaseConfig = {
    apiKey: "AIzaSyACJ7fi7_Rg_bFgTIacZef6OQckr6QKoTY",
    authDomain: "sil-bloomlibrary.firebaseapp.com",
    databaseURL: "https://sil-bloomlibrary.firebaseio.com",
    projectId: "sil-bloomlibrary",
    storageBucket: "sil-bloomlibrary.appspot.com",
    messagingSenderId: "481016061476",
    appId: "1:481016061476:web:8c9905ffec02e8579b82b1"
};

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
            .catch(err => {
                console.log(
                    "*** Signing out of firebase because of an error connecting to ParseServer"
                );
                firebase.auth().signOut();
            });
    });
});

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

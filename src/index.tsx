import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import firebase from "firebase";
import * as firebaseui from "firebaseui";

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

let ui: firebaseui.auth.AuthUI;
// if (ui) {
//   ui.reset();
// } else {
window.setTimeout(
    () => (ui = new firebaseui.auth.AuthUI(firebase.auth())),
    1000
);
//ui.reset();
// }
// ui.start('#firebaseui-auth-container', uiConfig);

// setTimeout(() => {
//     firebase
//         .auth()
//         .getRedirectResult()
//         .then((u: firebase.auth.UserCredential) => {
//             console.log(
//                 "@@@@@@@@@ (delayed) getRedirectResult " + JSON.stringify(u)
//             );
//         });
// }, 1000);
ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

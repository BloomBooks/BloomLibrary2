import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import firebase from "firebase";

it("renders without crashing", () => {
    const div = document.createElement("div");
    firebase.initializeApp({
        apiKey: "AIza....", // Auth / General Use
        authDomain: "YOUR_APP.firebaseapp.com", // Auth with popup/redirect
        databaseURL: "https://YOUR_APP.firebaseio.com", // Realtime Database
        storageBucket: "YOUR_APP.appspot.com", // Storage
        messagingSenderId: "123456789" // Cloud Messaging
    });
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});

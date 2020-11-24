import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as Sentry from "@sentry/browser";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { createBrowserHistory } from "history";
// these two firebase imports are strange, but not an error. See https://github.com/firebase/firebase-js-sdk/issues/1832
import firebase from "firebase/app";
import "firebase/auth";

//import * as firebaseui from "firebaseui";
import { connectParseServer } from "./connection/ParseServerConnection";
import { isEmbedded } from "./components/EmbeddingHost";

try {
    // we're sending errors so long as we're not running on localhost
    if (window.location.hostname.indexOf("bloomlibrary.org") > -1) {
        Sentry.init({
            dsn:
                "https://f33c34679bd044ba93eebb6fdf2132e3@sentry.keyman.com/18",
            environment: window.location.hostname,
            attachStacktrace: true,
        });
    }
} catch (error) {
    console.error(error);
}

const firebaseConfig = {
    apiKey: "AIzaSyACJ7fi7_Rg_bFgTIacZef6OQckr6QKoTY",
    authDomain: "sil-bloomlibrary.firebaseapp.com",
    databaseURL: "https://sil-bloomlibrary.firebaseio.com",
    projectId: "sil-bloomlibrary",
    storageBucket: "sil-bloomlibrary.appspot.com",
    messagingSenderId: "481016061476",
    appId: "1:481016061476:web:8c9905ffec02e8579b82b1",
};

// supports authentication, including automatic login if a cookie supports it.
// We don't ever allow things to behave as logged-in in embedded Bloom Library instances.
if (!isEmbedded()) {
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
}

/*  So this is a Single Page App with an internal router. That means, e.g. bloomlibrary.org/foobar doesn't actually have a page. It's
    just supposed to go to bloomlibrary.org, find the index.htm, and the let react-router figure out what to do with "/foo".
    To make this work, in the AWS S3 bucket for this site, we tell it that if it can't find a page (e.g. "foobar") it should
    send us back to index.htm.
    And this works as far as the user sees, but this is actually throwing a 404 error which messes up Google indexing and lowers our score.
    Previously, you could see the 404 errors in the network tab if you go to page other than the home page and do a REFRESH.
    It also prevents Chrome Lighthouse from doing some accessibility inspections.
    To fix this, we have the S3 bucket taking the part after the domain name and inserting a "#!" in there, so that it looks like an anchor
    into the page, so we don't get a 404. We put this in the bucket's Redirection Rules
    <RoutingRules>
        <RoutingRule>
            <Condition>
                <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
            </Condition>
            <Redirect>
                <HostName>alpha.bloomlibrary.org</HostName>
                <ReplaceKeyPrefixWith>#!/</ReplaceKeyPrefixWith>
            </Redirect>
        </RoutingRule>
        <RoutingRule>
            <Condition>
                <HttpErrorCodeReturnedEquals>403</HttpErrorCodeReturnedEquals>
            </Condition>
            <Redirect>
                <HostName>alpha.bloomlibrary.org</HostName>
                <ReplaceKeyPrefixWith>#!/</ReplaceKeyPrefixWith>
            </Redirect>
        </RoutingRule>
    </RoutingRules>
    You can see the whole S3 bucket setup here: https://i.imgur.com/mLgf0Gk.png
    Then this code removes that /#!/ so we are back to a simple bloomlibrary.og/foobar.
    This technique is described here: https://viastudio.com/hosting-a-reactjs-app-with-routing-on-aws-s3/
*/
const history = createBrowserHistory();
const path = (/#!(\/.*)$/.exec(window.location.hash) || [])[1];
if (path) {
    history.replace(path);
}

let uilang = new URLSearchParams(window.location.search).get("uilang");

ReactDOM.render(
    <App uiLanguage={uilang ?? undefined} />,
    document.getElementById("root")
);

//   `Add Message to Bloom Library Strings:\n${s.id},${s.defaultMessage}`
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

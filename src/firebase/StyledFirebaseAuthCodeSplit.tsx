import React, { useEffect, useState } from "react";
import firebase from "firebase/app"; // think this is just a namespace import, doesn't bring a lot of code
import { getFirebaseAuth } from "./firebase";

// StyledFirebaseAuth wrapped twice so that we can keep all the javascript involved in Firebase
// in a separate js file, downloaded to the user's browser only if he/she needs it.
// Because StyledFirebaseAuth needs to be initialized with objects only available
// after the getFirebaseAuth() promise is fulfilled, we must hide the inner wrapper until then.
export const StyledFirebaseAuthCodeSplit: React.FunctionComponent<{
    loginComplete: () => void;
}> = (props) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        getFirebaseAuth().then(() => setReady(true));
    }, []);

    return (
        <div>
            {ready && (
                <StyledFirebaseAuthCodeSplitInner
                    loginComplete={props.loginComplete}
                />
            )}
            ;
        </div>
    );
};

// This inner wrapper splits the code of StyledFirebaseAuth itself into a separate chunk.
const StyledFirebaseAuthCodeSplitInner: React.FunctionComponent<{
    loginComplete: () => void;
}> = (props) => {
    const StyledFirebaseAuth = React.lazy(
        () =>
            import(
                /* webpackChunkName: "firebase" */ "react-firebaseui/StyledFirebaseAuth"
            )
    );
    const uiConfig = {
        signInFlow: "popup",
        // signInSuccessUrl: "/",
        credentialHelper: "none", // don't show some weird "Account Chooser" thing with email login
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            //        firebase.auth.EmailAuthProvider.PROVIDER_ID
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                signInMethod: "password", //getEmailSignInMethod()
            },
        ],
        callbacks: {
            signInSuccessWithAuthResult: (
                authResult: any,
                redirectUrl: any
            ) => {
                /**********************
                 *
                 * In the redirect mode, this (and signInFailure) never get called.
                 * Maybe because we've redirected, sure.... so how is this supposed to work?
                 *
                 *
                 */
                //console.log(JSON.stringify(authResult));
                //setCurrentUser(authResult.user);
                // staticUser.set(authResult.user);
                //firebase.auth().updateCurrentUser(authResult.user);
                //alert("signInSuccessWithAuthResult");
                //console.log("signInSuccessWithAuthResult " + authResult.user);
                props.loginComplete();
                if (!authResult.user.emailVerified) {
                    authResult.user.sendEmailVerification().then(() => {
                        alert(
                            "Please check your email and click on the link there, then log in again."
                        );
                    });
                    firebase.auth().signOut();
                }
                return false;
            },
            signInFailure: (error: any) => {
                //Sentry.captureException(error); // probably won't happen, nothing seems to bring us here
                console.log("!!!!!!!!!!! signInFailure");
                alert("signInFailure");
                return new Promise((r, x) => {});
            },
        },
    };
    return (
        <React.Suspense fallback={<div>Loading login screen...</div>}>
            <StyledFirebaseAuth
                uiConfig={uiConfig as any}
                firebaseAuth={firebase.auth()}
            />
        </React.Suspense>
    );
};

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";

import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
// these two firebase imports are strange, but not an error. See https://github.com/firebase/firebase-js-sdk/issues/1832
import firebase from "firebase/app";
import "firebase/auth";
//import * as firebaseui from "firebaseui";
import { DialogTitle } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import * as Sentry from "@sentry/browser";

//import { staticUser } from "./User";

let staticShowLoginDialog: (doOpen: boolean) => void = () => {};
export { staticShowLoginDialog as ShowLoginDialog };

// Configure FirebaseUI.
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
        signInSuccessWithAuthResult: (authResult: any, redirectUrl: any) => {
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
            staticShowLoginDialog(false);
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
            Sentry.captureException(error); // probably won't happen, nothing seems to bring us here
            console.log("!!!!!!!!!!! signInFailure");
            alert("signInFailure");
            return new Promise((r, x) => {});
        },
    },
};

export const LoginDialog: React.FunctionComponent<{}> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    staticShowLoginDialog = (doOpen: boolean) => setIsOpen(doOpen);
    return (
        <Dialog
            className="loginDialog"
            open={isOpen}
            onClose={() => setIsOpen(false)}
            aria-labelledby="title"
        >
            <DialogTitle id="title">Sign In / Sign Up</DialogTitle>
            <div css={css``}>
                {/* <Button
                    variant="outlined"
                    onClick={() => {
                        firebase
                            .auth()
                            .signInWithRedirect(
                                new firebase.auth.GoogleAuthProvider()
                            );
                    }}
                >
                    Sign in with Google
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        firebase
                            .auth()
                            .signInWithRedirect(
                                new firebase.auth.EmailAuthProvider()
                            );
                    }}
                >
                    Sign in with email
                </Button> */}
                <StyledFirebaseAuth
                    uiConfig={uiConfig as any}
                    firebaseAuth={firebase.auth()}
                />
            </div>
        </Dialog>
    );
};

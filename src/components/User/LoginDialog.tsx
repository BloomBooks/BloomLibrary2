// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import "../commonDialog.scss";

import React, { useState, useEffect } from "react";

import ReactModal from "react-modal";

import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase";
import * as firebaseui from "firebaseui";
import { Button } from "@material-ui/core";

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
            signInMethod: "password" //getEmailSignInMethod()
        }
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
            console.log("signInSuccessWithAuthResult " + authResult.user);
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
            console.log("!!!!!!!!!!! signInFailure");
            alert("signInFailure");
            return new Promise((r, x) => {});
        }
    }
};

export const LoginDialog: React.FunctionComponent<{}> = props => {
    const [isOpen, setIsOpen] = useState(false);

    staticShowLoginDialog = (doOpen: boolean) => setIsOpen(doOpen);
    return (
        <ReactModal
            className="loginDialog"
            isOpen={isOpen}
            shouldCloseOnOverlayClick={true}
            onRequestClose={() => setIsOpen(false)}
            ariaHideApp={false}
            style={{
                overlay: { zIndex: 1000 }
            }}
        >
            <div>
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
        </ReactModal>
    );
};

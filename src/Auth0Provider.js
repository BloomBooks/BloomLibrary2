import React, { useState, useEffect, useContext } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";
import { loginWithAuth0, logout } from "./connection/Connection";

// This file provides a React wrapper for the Auth0 code that allows us to log in and out.
// It exports the Auth0Provider React component which wraps our entire app, and the useAuth0
// function which manages a Context and makes various information and functions available
// wherever needed. A useEffect() runs once only (because logging in and out both involve
// a redirect that reloads the page, and causes the once-only to happen again) that evaluates
// the current state of things and determines what user, if any, is logged in. The fields
// available through useAuth0() are those of the value assigned to the Auth0Provider in the
// final return statement.

const DEFAULT_REDIRECT_CALLBACK = () =>
    window.history.replaceState({}, document.title, window.location.pathname);

export const Auth0Context = React.createContext();
export const useAuth0 = () => useContext(Auth0Context);
export const Auth0Provider = ({
    children,
    onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
    ...initOptions
}) => {
    // True if auth0 says they are authenticated, e.g., entered a correct
    // username/password combination.
    const [isLoggedIn, setIsLoggedIn] = useState();
    // For most of our purposes, however, they are only authorized (to do things
    // as this user) if the successfully logged-in user has a verified email.
    const [isAuthorized, setIsAuthorized] = useState();
    // This is basically the combination of isLoggedIn && !isAuthorized,
    // but for one use in Header.tsx it's cleaner if there's a single state transition
    // to it being true.
    const [isUnverified, setIsUnverified] = useState();
    const [user, setUser] = useState();
    const [auth0Client, setAuth0] = useState();
    const [loading, setLoading] = useState(true);
    const [popupOpen, setPopupOpen] = useState(false);

    useEffect(() => {
        const initAuth0 = async () => {
            const auth0FromHook = await createAuth0Client(initOptions);
            setAuth0(auth0FromHook);

            // True immediately after a login redirect; auth0 appends code and state
            // params to the URL we gave it which the local auth0 code uses to
            // determine various things about the user who is logged in.
            if (window.location.search.includes("code=")) {
                const {
                    appState
                } = await auth0FromHook.handleRedirectCallback();
                onRedirectCallback(appState);
            }

            const loggedIn = await auth0FromHook.isAuthenticated();
            setIsLoggedIn(loggedIn);

            if (loggedIn) {
                const user = await auth0FromHook.getUser();
                setUser(user);
                const authorized = user.email_verified;
                setIsAuthorized(authorized);
                setIsUnverified(!user.email_verified);
                if (authorized) {
                    // Only if we have a verified email can we try to get a parse-server
                    // token.
                    const claims = await auth0FromHook.getIdTokenClaims();
                    // This is ugly and as far as we can find undocumented. But can't find any
                    // better way to get the original JWT token. It is an encoded (I think Base64)
                    // representation of a JSON object containing various login details
                    // that is signed using our app's private RSA256 key. This is the value we need
                    // to pass to parse-server to get a parse-server access token for this user.
                    // I asked auth0 about this and they recommend either (a) making a new HTTP
                    // request to get a raw token, or (b) replacing the @auth0/auth0-spa-js code
                    // with using a lower-level library. Neither appeals. So I'm leaving it like this.
                    // It may however require some rework if we some day get a different version of
                    // @auth0/auth0-spa-js.
                    const jwtEncodedToken = claims.__raw;
                    // Hook parse up to use this identity.
                    loginWithAuth0(jwtEncodedToken, user.email);
                }
            } else {
                setIsAuthorized(false);
                // probably redundant, see comment on method.
                logout();
            }

            setLoading(false);
        };
        initAuth0();
        // eslint-disable-next-line
    }, []);

    // This is saved from the original version of this code generated in the auth0
    // react-spa tutorial. I think it can be used to login with a popup instead of
    // by redirecting to the auth0 domain. However, I believe this requires 3rd party
    // cookies to be enabled, and is therefore likely to fail (by default in some
    // browsers, e.g., Firefox).
    // const loginWithPopup = async (params = {}) => {
    //     setPopupOpen(true);
    //     try {
    //         await auth0Client.loginWithPopup(params);
    //     } catch (error) {
    //         console.error(error);
    //     } finally {
    //         setPopupOpen(false);
    //     }
    //     const user = await auth0Client.getUser();
    //     setUser(user);
    //     setIsAuthenticated(true);
    // };

    return (
        // These values are available anywhere by code like
        // import { useAuth0 } from "../../Auth0Provider";
        // const {
        //     user,
        //     isLoggedIn,
        //     isAuthorized,
        //     logout
        // } = useAuth0()
        <Auth0Context.Provider
            value={{
                isLoggedIn,
                isAuthorized,
                isUnverified,
                user,
                loading,
                popupOpen,
                //loginWithPopup,
                getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
                loginWithRedirect: (...p) =>
                    auth0Client.loginWithRedirect(...p),
                getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
                getTokenWithPopup: (...p) =>
                    auth0Client.getTokenWithPopup(...p),
                logout: (...p) => auth0Client.logout(...p)
            }}
        >
            {children}
        </Auth0Context.Provider>
    );
};

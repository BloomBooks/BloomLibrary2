import React, { useState, useEffect, useContext } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";
import { loginWithAuth0, logout } from "./connection/Connection";

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
                const authorized = user.email_verified;
                setIsAuthorized(authorized);
                setIsUnverified(!user.email_verified);
                setUser(user);
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
                    console.log("auth0FromHook data:");
                    console.log(JSON.stringify(auth0FromHook));
                    console.log("claims data:");
                    console.log(JSON.stringify(claims));
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

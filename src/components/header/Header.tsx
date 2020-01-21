// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import logo from "./header-logo.png";
import { SearchBox } from "../SearchBox";
import { useAuth0 } from "../../Auth0Provider";
import { Button, Menu, MenuItem } from "@material-ui/core";
import loginIcon from "../../assets/NoUser.svg";

export const Header: React.FunctionComponent<{}> = props => {
    const {
        user,
        isLoggedIn,
        isAuthorized,
        isUnverified,
        loginWithRedirect,
        logout
    } = useAuth0();

    const logoutWithRedirect = () =>
        logout({
            returnTo: window.location.origin
        });
    useEffect(() => {
        if (isUnverified) {
            alert("Please verify your email address, then log in again");
            logoutWithRedirect();
        }
    }, [isUnverified]);

    const toolbarHeight = "48px";
    // This variable is used according to an apparently standard but rather
    // obscure convention for managing Material button/menu combinations.
    // When the menu is hidden, it is null. When the menu is showing, it
    // is the element that determines the position of the menu...in our case,
    // the element clicked. It's supposed to be an actual HTML element, which
    // isn't easily accessible in React, so we get it (in showMenu) from the
    // target of the clickAction. Since only one of the two button/menu
    // combinations is visible at any one time, a single state works for both.
    const [anchorEl, setAnchorEl] = useState(null as Element | null);
    const showMenu = (ev: any) => {
        setAnchorEl(ev.target as Element);
    };
    const closeMenu = () => setAnchorEl(null);
    const handleNotImplemented = () => {
        closeMenu();
        alert("not implemented yet");
    };
    const handleLogin = () => {
        closeMenu();
        loginWithRedirect();
    };
    const handleSignup = () => {
        closeMenu();
        // The main url is the same as is configured (for login) when initializing
        // Auth0Provider in index.tsx. The extra parameter triggers some server-side
        // code...see auth0.com dashboard, Universal Login, Login tab, custom Login code...which uses
        // this as a trigger for showing the signup tab instead of the login one.
        // If you decide to use a different trigger remember to change it in both
        // tenants as well as here.
        loginWithRedirect({
            redirect_uri: window.location.origin,
            login_hint: "signUp"
        });
    };
    const handleLogout = () => {
        closeMenu();
        logoutWithRedirect();
    };
    return (
        <div
            css={css`
                display: flex;
                background-color: #1c1c1c;
                height: ${toolbarHeight};
                flex-shrink: 0;
                padding: 10px;
                padding-left: 20px;
                box-sizing: content-box;
            `}
        >
            <a href="/" title="Home">
                <img src={logo} alt={"Bloom Logo"} />
            </a>
            {/* The margin-left:auto here allows the containing flex-box to insert any spare space
            into this element's margin-left, typically putting a large gap there and making
            it the left-most of the block of controls at the right of the header.*/}
            <div
                className={css`
                    margin-left: auto;
                `}
            >
                {!isAuthorized && (
                    <>
                        {/* Material recommends a trick I could not make sense of to let Emotion styles
                        beat Material ones, but there seems no reason to avoid !important here: we
                        definitely always want to get rid of the Material top padding so the img aligns
                        with other things in the Header.*/}
                        <Button
                            aria-controls="login-menu"
                            aria-haspopup="true"
                            onClick={showMenu}
                            className={css`
                                padding-top: 0 !important;
                            `}
                        >
                            <img
                                src={loginIcon}
                                className={css`
                                    width: ${toolbarHeight};
                                `}
                                alt="login"
                            ></img>
                        </Button>
                        <Menu
                            id="login-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={closeMenu}
                        >
                            <MenuItem onClick={handleSignup}>Sign Up</MenuItem>
                            <MenuItem onClick={handleLogin}>Login</MenuItem>
                        </Menu>
                    </>
                )}

                {isAuthorized && (
                    <>
                        <Button
                            aria-controls="logout-menu"
                            aria-haspopup="true"
                            onClick={showMenu}
                            className={css`
                                padding-top: 0 !important;
                            `}
                            // If we decide not to log out users with unverified emails immediately,
                            // this or similar can be used to highlight the fact that the user is
                            // unverified (and hence not authorized).
                            // style={{
                            //     border: isAuthorized ? "" : "2px solid red"
                            // }}
                        >
                            {user && user.picture && (
                                <img
                                    src={user.picture}
                                    alt="user"
                                    className={css`
                                        width: ${toolbarHeight};
                                    `}
                                ></img>
                            )}
                            {(!user || !user.picture) && <>Logout</>}
                        </Button>
                        <Menu
                            id="logout-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={closeMenu}
                        >
                            <MenuItem onClick={closeMenu}>
                                {user && user.picture && (
                                    <img
                                        src={user.picture}
                                        alt="user"
                                        className={css`
                                            width: ${toolbarHeight};
                                        `}
                                    ></img>
                                )}
                                {user && user.email && <>{user.email}</>}
                            </MenuItem>
                            <MenuItem onClick={handleNotImplemented}>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleNotImplemented}>
                                My Books
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                        </Menu>
                    </>
                )}
            </div>
            <SearchBox />
        </div>
    );
};

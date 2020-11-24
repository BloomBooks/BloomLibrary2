// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../components/header/Header";
import { Routes } from "../components/Routes";
import { Footer } from "../components/Footer";
import { useIsEmbedded } from "../components/EmbeddingHost";

// What we want inside the <Router> component. Has to be its own component so that we can have
// useLocation(), which only works inside the Router.
export const RouterContent: React.FunctionComponent<{}> = (props) => {
    const location = useLocation();
    const showingPlayer = location.pathname.startsWith("/player/");
    const embeddedMode = useIsEmbedded();
    return (
        <React.Fragment>
            {embeddedMode || showingPlayer || <Header />}
            {/* This div takes up all the space available so that the footer
        is either at the bottom or pushed off screen. If we're showing the player,
        we don't have a header or footer. In most browsers, flex 1 0 auto would
        still work, and the one and only child div would take all the space.
        However, at the next level, we want the player iframe to fill the available
        height. In Safari (grrrrrr!), it doesn't work to make an iframe 100%
        of the height of a parent whose height is determined by flex grow.
        So, in that one case, we simply make this div have height 100%.*/}
            <div
                id="expandableContent"
                css={css`
                    ${showingPlayer ? "height: 100%;" : "flex: 1 0 auto;"}
                `}
                role="main"
            >
                <Routes />
            </div>
            {embeddedMode || showingPlayer || <Footer />}
        </React.Fragment>
    );
};

export default RouterContent;

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Header } from "../components/header/Header";
import { Routes } from "../components/Routes";
import { FooterCodeSplit } from "../components/FooterCodeSplit";
import { useIsEmbedded } from "../components/EmbeddingHost";
import { kStatsPageGray } from "../components/statistics/StatsInterfaces";
import { useIsAppHosted } from "../components/appHosted/AppHostedUtils";
import { SearchStyle } from "../components/SearchBox";
import { Button, SvgIcon } from "@material-ui/core";
import { ReactComponent as SearchingDeeper } from "../assets/SearchingDeeper.svg";
import { commonUI } from "../theme";
import { useIntl } from "react-intl";

// What we want inside the <Router> component. Has to be its own component so that we can have
// useLocation(), which only works inside the Router.
export const RouterContent: React.FunctionComponent<{}> = (props) => {
    const location = useLocation();
    const history = useHistory();
    const showingPlayer = location.pathname.startsWith("/player/");
    const appHostedMode = useIsAppHosted();
    const embeddedMode = useIsEmbedded();

    const showHeaderAndFooter = !(
        embeddedMode ||
        appHostedMode ||
        showingPlayer
    );

    // Enhance: use location.pathname to initialize searchResultStyle?
    const [searchResultStyle, setSearchResultStyle] = useState(
        SearchStyle.Empty
    );
    const [desiredSearchResultStyle, setDesiredSearchResultStyle] = useState(
        SearchStyle.Empty
    );
    let desiredSearchStyle: SearchStyle | undefined = undefined;
    if (desiredSearchResultStyle === SearchStyle.Deeper) {
        desiredSearchStyle = desiredSearchResultStyle;
    }
    const updateDeeperSearchButton = (searchResultStyle: SearchStyle) => {
        setSearchResultStyle(searchResultStyle);
        setDesiredSearchResultStyle(SearchStyle.Empty); // placeholder value
    };
    const l10n = useIntl();

    function HandleDeeperSearch(): void {
        const newPath = location.pathname.replace(
            /^\/:search:title%3A"(.*)"$/,
            "/:search:$1"
        );
        history.replace(newPath);
        setSearchResultStyle(SearchStyle.Deeper);
        setDesiredSearchResultStyle(SearchStyle.Deeper);
    }

    return (
        <React.Fragment>
            {showHeaderAndFooter && (
                <Header
                    setSearchResultStyle={updateDeeperSearchButton}
                    initialSearchStyle={desiredSearchStyle}
                />
            )}
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
                    ${showingPlayer || appHostedMode
                        ? "height: 100%;"
                        : "flex: 1 0 auto;"}
                    // I apologize for this hack
                    ${location.pathname.indexOf("/stats") > -1
                        ? `background-color:${kStatsPageGray}`
                        : ""}
                `}
                role="main"
            >
                <Routes searchResultStyle={searchResultStyle} />
                {searchResultStyle === SearchStyle.Shallow && (
                    <Button
                        variant="contained"
                        css={css`
                            margin-left: 20px;
                            color: white;
                            background-color: ${commonUI.colors.bloomRed};
                            width: 160px;
                        `}
                        onClick={() => HandleDeeperSearch()}
                    >
                        <SvgIcon
                            css={css`
                                padding-right: 5px;
                                width: 39px;
                            `}
                            component={SearchingDeeper}
                            viewBox="0 0 39 33"
                        ></SvgIcon>
                        <div
                            css={css`
                                line-height: 1.2;
                                padding-top: 5px;
                                padding-bottom: 5px;
                            `}
                        >
                            {l10n.formatMessage({
                                id: "header.searchDeeper",
                                defaultMessage: "Search Deeper",
                            })}
                        </div>
                    </Button>
                )}
            </div>
            {showHeaderAndFooter && <FooterCodeSplit />}
        </React.Fragment>
    );
};

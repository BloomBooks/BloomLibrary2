// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import logo from "./header-logo.svg";
import { SearchBox } from "../SearchBox";
import { UserMenuCodeSplit } from "../User/UserMenuCodeSplit";
import { commonUI } from "../../theme";
import { useMediaQuery, Tab, Tabs } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import { useIntl } from "react-intl";
import { BlorgLink } from "../BlorgLink";
import { isInCreateSectionOfSite } from "../pages/ThemeForLocation";

export const Header: React.FunctionComponent<{}> = (props) => {
    const location = useLocation();
    const createTabSelected = isInCreateSectionOfSite(location.pathname);
    const routerHistory = useHistory();
    const showSearchBelow = !useMediaQuery("(min-width:975px)");
    const showReadCreateBelow = !useMediaQuery("(min-width:560px)");
    const showReadCreateNarrower = !useMediaQuery("(min-width:640px)");
    // At widths less than 300px, the User Menu sticks out to the right and causes horizontal scrolling.
    const showUserMenu = useMediaQuery("(min-width:300px)");
    const normalToobarHeight = "48px";
    let toolbarHeight = normalToobarHeight;
    if (showReadCreateBelow) {
        toolbarHeight = "146px";
    } else if (showSearchBelow) {
        toolbarHeight = "100px";
    }
    const l10n = useIntl();

    const minTabWidth = showReadCreateNarrower ? "min-width:110px" : "";

    const backgroundColor = createTabSelected
        ? commonUI.colors.creationArea
        : commonUI.colors.bloomRed;
    // 14pt bold is the minimum size for white text on bloom-red to be considered accessible
    const tabStyle = css`
        color: white !important;
        font-size: 14pt !important;
        font-weight: bold !important;
        flex-shrink: 2;
    `;
    const readCreateTabs = (
        <Tabs
            value={createTabSelected ? 1 : 0}
            onChange={(e, value) => {
                //setCreateTabSelected(value);
                routerHistory.push(value ? "/create" : "/read");
                // window.history.pushState(
                //     {},
                //     "foo",
                //     value ? "/create" : "/read"
                // );
            }}
            // The margin-right generally grows and may well be much bigger than 30px.
            // The low value allows things to get tight without the text being cut off by the margin.
            // The opacity of 1 defeats the default MUI behavior of dimming the unselected tab text,
            // which leaves us without sufficient contrast between text and background for
            // accessibility.
            css={css`
                margin-left: ${showReadCreateBelow ? "0" : "30px"};
                margin-right: 13px;
                .MuiTabs-indicator {
                    background-color: white !important;
                }
                .MuiTab-root {
                    ${minTabWidth}
                }
                .MuiTab-textColorInherit {
                    opacity: 1;
                }
            `}
            role="navigation"
        >
            <Tab
                label={l10n.formatMessage({
                    id: "header.read",
                    defaultMessage: "Read",
                })}
                css={tabStyle}
            ></Tab>
            <Tab
                label={l10n.formatMessage({
                    id: "header.create",
                    defaultMessage: "Create",
                })}
                css={tabStyle}
            ></Tab>
        </Tabs>
    );
    return (
        <div
            css={css`
                display: block;
                background-color: ${backgroundColor};
                transition: background-color 0.5s ease;
                height: ${toolbarHeight};
                flex-shrink: 0;
                padding: 10px;
                padding-left: 20px;
                box-sizing: content-box;
            `}
            role="banner"
        >
            <div
                css={css`
                    display: flex;
                    height: ${normalToobarHeight};
                    flex-shrink: 0;
                    box-sizing: content-box;
                    justify-content: space-between;
                    flex-direction: row;
                `}
            >
                <BlorgLink
                    css={css`
                        margin-top: auto !important;
                    `}
                    href="/"
                    title={l10n.formatMessage({
                        id: "header.home",
                        defaultMessage: "Home",
                    })}
                >
                    <img
                        src={logo}
                        alt={l10n.formatMessage({
                            id: "header.bloomLogo",
                            defaultMessage: "Bloom Logo",
                        })}
                    />
                </BlorgLink>
                {showReadCreateBelow || readCreateTabs}
                {showSearchBelow || (
                    <div
                        // The margin-left:auto here (or on UserMenu if search is below)
                        // allows the containing flex-box to insert any spare space
                        // into this element's margin-left, typically putting a large gap there and making
                        // it the left-most of the block of controls at the right of the header.
                        css={css`
                            display: flex;
                            margin-left: auto;
                        `}
                    >
                        <SearchBox />
                    </div>
                )}
                {showUserMenu && (
                    <UserMenuCodeSplit
                        buttonHeight={normalToobarHeight}
                        css={css`
                            ${showSearchBelow ? "margin-left: auto" : ""};
                        `}
                    />
                )}
            </div>
            {showReadCreateBelow && readCreateTabs}
            {showSearchBelow && (
                <div
                    css={css`
                        display: flex;
                        margin-top: 8px;
                    `}
                >
                    <SearchBox cssExtra="margin-left: auto; margin-right:10px; width:100%" />
                </div>
            )}
        </div>
    );
};

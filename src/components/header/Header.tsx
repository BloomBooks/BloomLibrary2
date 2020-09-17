// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import logo from "./header-logo.svg";
import { SearchBox } from "../SearchBox";
import { UserMenu } from "../User/UserMenu";
import { commonUI } from "../../theme";
import { useMediaQuery, Tab, Tabs } from "@material-ui/core";
import { useHistory, Link, useLocation } from "react-router-dom";
import { useIntl } from "react-intl";

export const Header: React.FunctionComponent = () => {
    const location = useLocation();
    const createTabSelected = location.pathname.indexOf("/create") > -1;
    const routerHistory = useHistory();
    const showSearchBelow = !useMediaQuery("(min-width:975px)");
    const showReadCreateBelow = !useMediaQuery("(min-width:560px)");
    const showReadCreateNarrower = !useMediaQuery("(min-width:640px)");
    const normalToobarHeight = "48px";
    let toolbarHeight = normalToobarHeight;
    if (showReadCreateBelow) {
        toolbarHeight = "146px";
    } else if (showSearchBelow) {
        toolbarHeight = "100px";
    }
    const l10n = useIntl();
    // review: should this be a prop?
    const hideHeader = location.pathname.startsWith("/player/");
    if (hideHeader) return <React.Fragment></React.Fragment>;

    const minTabWidth = showReadCreateNarrower ? "min-width:110px" : "";

    const backgroundColor = createTabSelected
        ? commonUI.colors.creationArea
        : commonUI.colors.bloomRed;
    const tabStyle = css`
        color: white !important;
        font-size: 18px !important;
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
            css={css`
                margin-left: ${showReadCreateBelow ? "0" : "30px"};
                margin-right: 30px;
                .MuiTabs-indicator {
                    background-color: white !important;
                }
                .MuiTab-root {
                    ${minTabWidth}
                }
            `}
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
                <Link
                    css={css`
                        margin-top: auto !important;
                    `}
                    to="/"
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
                </Link>
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
                <UserMenu
                    buttonHeight={normalToobarHeight}
                    css={css`
                        ${showSearchBelow ? "margin-left: auto" : ""};
                    `}
                />
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
            {/* Language:
            <FormattedMessage
                id="language.name"
                defaultMessage="DEFAULT"
            ></FormattedMessage> */}
        </div>
    );
};

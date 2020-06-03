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
import Link from "@material-ui/core/Link/Link";
import { useMediaQuery, Tab, Tabs } from "@material-ui/core";

export const Header: React.FunctionComponent = () => {
    const searchBelow = !useMediaQuery("(min-width:500px)");
    const normalToobarHeight = "48px";
    const toolbarHeight = searchBelow ? "90px" : normalToobarHeight;
    const s: string = window.location.pathname;
    const inCreate = s.indexOf("/create") > -1;
    const backgroundColor = inCreate
        ? commonUI.colors.createArea
        : commonUI.colors.bloomRed;
    const tabStyle = css`
        color: white !important;
        font-size: 18px !important;
    `;
    return (
        <div
            css={css`
                display: flex;
                background-color: ${backgroundColor};
                height: ${toolbarHeight};
                flex-shrink: 0;
                padding: 10px;
                padding-left: 20px;
                box-sizing: content-box;
                justify-content: space-between;
                flex-direction: ${searchBelow ? "column" : "row"};
            `}
        >
            <Link
                css={css`
                    margin-top: auto !important;
                `}
                href="/"
                title="Home"
            >
                <img src={logo} alt={"Bloom Logo"} />
            </Link>
            {/* <div
                css={css`
                    margin-left: 30px;
                    margin-top: auto;
                    & > * {
                        color: white !important;
                    }
                `}
            > */}
            <Tabs
                value={inCreate ? 1 : 0}
                onChange={(e, value) =>
                    window.location.assign(value ? "/create" : "/read")
                }
                css={css`
                    margin-right: 30px;

                    .MuiTabs-indicator {
                        background-color: white !important;
                    }
                `}
            >
                <Tab label={"Read"} css={tabStyle}></Tab>
                <Tab label={"Create"} css={tabStyle}></Tab>
            </Tabs>
            {searchBelow || (
                <React.Fragment>
                    <div
                        css={css`
                            display: flex;
                            margin-left: auto;
                        `}
                    >
                        <SearchBox />
                        {/* The margin-left:auto here allows the containing flex-box to insert any spare space
            into this element's margin-left, typically putting a large gap there and making
            it the left-most of the block of controls at the right of the header.*/}
                        <UserMenu buttonHeight={normalToobarHeight} />
                    </div>
                </React.Fragment>
            )}
            {searchBelow && (
                <React.Fragment>
                    <div
                        css={css`
                            display: flex;
                        `}
                    >
                        <UserMenu
                            buttonHeight={normalToobarHeight}
                            css={css`
                                margin-left: auto;
                            `}
                        />
                    </div>

                    <SearchBox cssExtra="margin-left: auto; margin-right:5px;" />
                </React.Fragment>
            )}
        </div>
    );
};

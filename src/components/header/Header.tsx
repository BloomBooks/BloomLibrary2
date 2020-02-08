// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import logo from "./header-logo.svg";
import { SearchBox } from "../SearchBox";
import { UserMenu } from "../User/UserMenu";
import { bloomRed } from "../../theme";
import Link from "@material-ui/core/Link/Link";

export const Header: React.FunctionComponent<{}> = props => {
    const toolbarHeight = "48px";
    return (
        <React.StrictMode>
            <div
                css={css`
                    display: flex;
                    background-color: ${bloomRed};
                    height: ${toolbarHeight};
                    flex-shrink: 0;
                    padding: 10px;
                    padding-left: 20px;
                    box-sizing: content-box;
                    justify-content: space-between;
                `}
            >
                <Link href="/" title="Home">
                    <img src={logo} alt={"Bloom Logo"} />
                </Link>
                <div
                    css={css`
                        display: flex;
                    `}
                >
                    <SearchBox />
                    {/* The margin-left:auto here allows the containing flex-box to insert any spare space
            into this element's margin-left, typically putting a large gap there and making
            it the left-most of the block of controls at the right of the header.*/}
                    <UserMenu
                        buttonHeight={toolbarHeight}
                        css={css`
                            margin-left: auto;
                        `}
                    />
                </div>
            </div>
        </React.StrictMode>
    );
};

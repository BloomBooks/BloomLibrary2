// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import logo from "./header-logo.png";
import { SearchBox } from "../SearchBox";
import { User } from "../User";

export const Header: React.FunctionComponent<{}> = props => {
    const toolbarHeight = "48px";
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
            <User
                buttonHeight={toolbarHeight}
                className={css`
                    margin-left: auto;
                `}
            />
            <SearchBox />
        </div>
    );
};

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import logo from "./header-logo.png";
import { SearchBox } from "../SearchBox";
export const Header: React.FunctionComponent<{}> = props => {
    return (
        <div
            css={css`
                display: flex;
                background-color: #1c1c1c;
                height: 48px;
                flex-shrink: 0;
                padding: 10px;
                padding-left: 20px;
                box-sizing: content-box;
            `}
        >
            <a href="/" title="Home">
                <img src={logo} alt={"Bloom Logo"} />
            </a>
            <SearchBox />
        </div>
    );
};

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { RouterContext } from "../Router";

export const Footer: React.FunctionComponent = (props) => {
    const router = useContext(RouterContext);

    return (
        <ul
            css={css`
                padding: 20px;
                //height: 6em;
                color: white;
                background-color: black;
            `}
        >
            <li>Support</li>
        </ul>
    );
};

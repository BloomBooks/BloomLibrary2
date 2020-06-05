// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";

/* these are styles that used to be applied, which we may want for this new class
    .pageResults {
    margin: 0;
    padding-left: 20px;
    /* Without this, as a list-item, I get an unwanted white border on top
    display: inline-block;
    background-color: f2f2f2;

    flex-grow: 1;
}*/

export const ListOfBookGroups: React.FunctionComponent = (props) => (
    <ul
        css={css`
            padding-left: 20px;
            min-height: 200px;
        `}
    >
        {props.children}
    </ul>
);

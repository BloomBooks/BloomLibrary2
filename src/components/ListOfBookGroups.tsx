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

export const ListOfBookGroups: React.FunctionComponent<{
    className?: string;
}> = (props) => (
    // A ul apparently defaults to flex-shrink:1. And that's a problem for us, because it's parent
    // is display:flex and height:100% and a list of book groups is usually more than a screen high.
    // So the browser tries to shrink it. It can't really do so, but it does anyway, so now
    // the ul overflows. And then the footer which is supposed to come after it overlaps some of the
    // rows of cards.
    <ul
        css={css`
            padding-left: 20px;
            min-height: 200px;
            flex-shrink: 0;
            list-style: none;
        `}
        className={props.className} // for css
    >
        {props.children}
    </ul>
);

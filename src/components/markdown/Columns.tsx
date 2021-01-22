// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import * as React from "react";

// Provide multiple columns within an outer block using flex.
export const Columns: React.FunctionComponent<{ className?: string }> = (
    props
) => {
    return (
        <div
            className={props.className || "columns"}
            css={css`
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: space-between;
                column-gap: 2em;
                padding-left: 1em;
                padding-right: 1em;
            `}
        >
            {props.children}
        </div>
    );
};

export const Column: React.FunctionComponent<{ className?: string }> = (
    props
) => {
    // Every column starts at 1%, then grows proportionally to flex-grow
    // Without setting flex-basis, flex-grow seems to have little effect.
    return (
        <div
            className={props.className || "column"}
            css={css`
                flex-grow: 1;
                flex-basis: 1%;
                // if you change this, remember to check the about page,
                // Services section, and see how it changes with various screen widths.
                min-width: 200px;
            `}
        >
            {props.children}
        </div>
    );
};

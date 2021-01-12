// Display a testimonial with a left border highlighting the text and attribution.

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import * as React from "react";

export const Testimonial: React.FunctionComponent<{}> = (props) => {
    return (
        <div
            css={css`
                border-left-style: solid;
                border-left-color: green;
                border-left-width: 3px;
                padding-left: 20px;
            `}
        >
            {props.children}
        </div>
    );
};

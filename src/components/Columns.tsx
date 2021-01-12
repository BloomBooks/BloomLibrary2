// Provide multiple columns within an outer block using flex.
// flex-grow and flex-basis are used to control the relative widths of the columns.
// The default is equal-width columns as much as possible depending on content.

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import * as React from "react";

export const Columns: React.FunctionComponent<{}> = (props) => {
    return (
        <div
            className="multiple-column-container"
            css={css`
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
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

export interface IColumnProps extends React.HTMLAttributes<HTMLElement> {
    flexGrow?: number; // optional value
}

export const Column: React.FunctionComponent<IColumnProps> = (props) => {
    // Every column starts at 1%, then grows proportionally to flex-grow
    // Without setting flex-basis, flex-grow seems to have little effect.
    return (
        <div
            css={css`
                flex-grow: ${props.flexGrow ? props.flexGrow : 1};
                flex-basis: 1%;
            `}
        >
            {props.children}
        </div>
    );
};

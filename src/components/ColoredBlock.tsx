// Display a block with a colored background.
// Optional padding is provided.
// Optional background image is allowed. (This feature is very rudimentary and untested at present.)

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import * as React from "react";

export interface IColoredBlockProps extends React.HTMLAttributes<HTMLElement> {
    color: string; // could be color name or RGB value like "#b1e29d"
    padding?: string; // optional measurement like "0px 30px"
    image?: string; // optional value like "url('mybackground.png')"
}

export const ColoredBlock: React.FunctionComponent<IColoredBlockProps> = (
    props
) => {
    return (
        <div
            className="colored-block"
            css={css`
                background-color: ${props.color};
                padding: ${props.padding};
                background-image: ${props.image};
            `}
        >
            {props.children}
        </div>
    );
};

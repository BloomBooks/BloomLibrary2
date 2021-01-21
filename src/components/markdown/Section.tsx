// Display a block with a colored background.
// Optional background image is allowed. (This feature is very rudimentary and untested at present.)

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import * as React from "react";
import Container from "@material-ui/core/Container";

export interface IColoredBlockProps extends React.HTMLAttributes<HTMLElement> {
    color: string; // could be color name or RGB value like "#b1e29d"
    image?: string; // optional value like "url('mybackground.png')"
    textColor?: string;
    className?: string;
    prose?: boolean;
}

export const Section: React.FunctionComponent<IColoredBlockProps> = (props) => {
    return (
        <section
            className={props.className}
            css={css`
                background-color: ${props.color};
                background-image: ${props.image};
                padding-bottom: 1em;
                padding-top: 1em;
                // make text within the colored block white
                color: ${props.textColor || "black"};
                // this is a mystery. Without it, there are bands of space
                // between sections
                border-top: solid 1px transparent;
            `}
        >
            {/* we want prose blocks to be narrower */}
            <Container maxWidth={props.prose ? "sm" : "md"}>
                {props.children}
            </Container>
        </section>
    );
};

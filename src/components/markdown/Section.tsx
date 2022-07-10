// Display a block with a colored background.
// Optional background image is allowed. (This feature is very rudimentary and untested at present.)

import { css } from "@emotion/react";

import * as React from "react";
import Container from "@material-ui/core/Container";

export interface IColoredBlockProps extends React.HTMLAttributes<HTMLElement> {
    backgroundColor: string; // could be color name or RGB value like "#b1e29d"
    image?: string; // optional value like "url('mybackground.png')"
    textColor?: string;
    className?: string;
    prose?: boolean;
    children?: React.ReactNode;
}

export const Section: React.FunctionComponent<IColoredBlockProps> = (props) => {
    return (
        <section
            className={props.className}
            css={css`
                background-color: ${props.backgroundColor};
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
                {React.Children.only(props.children) || React.Fragment}
            </Container>
        </section>
    );
};

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";
import { getUrlForTarget } from "./Routes";
import { BlorgLink } from "./BlorgLink";
import { useBaseCardSpec } from "./CardGroup";
import { useCardHoverStyles } from "../theme";

interface IProps extends React.HTMLProps<HTMLDivElement> {
    className?: string;
    target?: string; // what we're calling "target" is the last part of url, where the url is <breadcrumb stuff>/<target>
    url?: string; // if present, this overrides target and is used unmodified as the url to go to.
    role?: string;
    textColorOverride?: string;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    stacked?: boolean;
}

// just a wrapper around the children you provide, made to look like a card and responsive to a click.
export const CheapCard: React.FunctionComponent<IProps> = (props) => {
    const url = props.url ?? getUrlForTarget(props.target || "");
    const cardSpacing = useBaseCardSpec().cardSpacingPx;
    const hoverStyles = useCardHoverStyles();
    return (
        <BlorgLink
            className={`cheapCard ${props.className}`}
            css={css`
                overflow-wrap: break-word; /* helps with titles that have super long words, else they scroll */
                flex-shrink: 0;
                display: flex;
                flex-direction: column;

                margin-bottom: ${cardSpacing}px;
                margin-right: ${cardSpacing}px;
                background-color: white;
                border-radius: 4px;

                box-shadow: ${props.stacked
                    ? " 0 1px 3px black, 3px 3px white, 5px 5px darkgray;"
                    : "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24); "};

                @media (hover) {
                    // On IOS, if a hover effect is animated, it takes two clicks to activate the link.
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    &:hover {
                        ${hoverStyles}
                    }
                }

                /* for on dark background*/
                //border: solid white;
                box-sizing: border-box;

                /* Allows the top and left shadow of cards to appear correctly. */
                top: 1px;
                left: 1px;

                overflow: hidden;

                text-decoration: none;
                &,
                &:visited {
                    color: ${props.textColorOverride
                        ? props.textColorOverride
                        : "black"};
                }

                position: relative;

                color: ${props.textColorOverride
                    ? props.textColorOverride
                    : "inherit"};

                // NOTE! There are more css rules that can come from the parent
                // component, e.g. collection card. In the debugger they'll all
                // show together (with the overrides from the parent at the end).
            `}
            href={url}
            role={props.role}
            onMouseDown={props.onMouseDown}
            onMouseUp={props.onMouseUp}
        >
            {/* the empty string here prevents a console warning from MuiLink when the children aren't available yet */}
            {props.children ?? ""}
        </BlorgLink>
    );
};

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { commonUI } from "../theme";
import { getUrlForTarget } from "./Routes";
import { BlorgLink as Link } from "./BlorgLink";

interface IProps extends React.HTMLProps<HTMLDivElement> {
    className?: string;
    target?: string; // what we're calling "target" is the last part of url, where the url is <breadcrumb stuff>/<target>
    role?: string;
    kind?: "short" | undefined;
}

// just a wrapper around the children you provide, made to look like a card and responsive to a click.
export const CheapCard: React.FunctionComponent<IProps> = (props) => {
    const url = getUrlForTarget(props.target || "");
    return (
        <Link
            //{...props}
            className={`cheapCard ${props.className}`}
            css={css`
                overflow-wrap: break-word; /* helps with titles that have super long words, else they scroll */
                flex-shrink: 0;
                display: flex;
                flex-direction: column;

                margin-bottom: ${commonUI.cheapCardMarginBottomInPx}px;
                height: ${props.kind === "short"
                    ? "40px"
                    : "190px"}; // todo derive from commonUI.something
                margin-right: 5px;
                background-color: white;
                border-radius: 4px;

                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12),
                    0 1px 2px rgba(0, 0, 0, 0.24);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                &:hover {
                    box-shadow: 0 4px 5px rgba(0, 0, 0, 0.25),
                        0 4px 5px rgba(0, 0, 0, 0.22);
                    background-color: lightgray;
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
                    color: black;
                }
            `}
            to={url}
            role={props.role}
        >
            {props.children}
        </Link>
    );
};

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { commonUI } from "../theme";

interface IProps extends React.HTMLProps<HTMLDivElement> {
    onClick?: () => void;
    className?: string;
}

// just a wrapper around the children you provide, made to look like a card and responsive to a click.
export const CheapCard: React.FunctionComponent<IProps> = props => (
    <div
        {...props}
        className={`cheapCard ${props.className}`}
        css={cardStyle}
        onClick={() => {
            if (props.onClick) {
                props.onClick();
            }
            //   this.props.browseState.push(this.props.target);
        }}
    >
        {props.children}
    </div>
);

const cardStyle = css`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    margin-bottom: ${commonUI.cheapCardMarginBottomInPx}px;
    height: 190px;
    margin-right: 5px;
    background-color: white;
    border-radius: 4px;

    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &:hover {
        box-shadow: 0 4px 5px rgba(0, 0, 0, 0.25), 0 4px 5px rgba(0, 0, 0, 0.22);
        background-color: lightgray;
    }

    /* for on dark background*/
    //border: solid white;
    box-sizing: border-box;

    /* Allows the top and left shadow of cards to appear correctly. */
    top: 1px;
    left: 1px;

    overflow: hidden;
`;

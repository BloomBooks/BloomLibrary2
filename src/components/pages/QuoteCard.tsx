// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { commonUI } from "../../theme";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

export const QuoteCard: React.FunctionComponent<{}> = (props) => {
    return (
        <Card
            css={css`
                background-color: #e9ffd8 !important;
                //padding: 20px;
                max-width: 350px;
                margin-left: auto;
                margin-right: auto;
                p {
                    margin-block-start: 0;
                    margin-block-end: 0;
                }
            `}
        >
            <CardContent
                css={css`
                    position: relative;
                `}
            >
                {props.children}
            </CardContent>
        </Card>
    );
};
export const Quote: React.FunctionComponent<{}> = (props) => {
    return (
        <blockquote
            css={css`
                &::before {
                    content: "“";
                    color: ${commonUI.colors.creationArea};
                    font-size: 4em;
                    position: absolute;
                    left: 10px;
                    top: 20px;
                }

                font-style: italic;
            `}
        >
            {props.children}
        </blockquote>
    );
};
export const QuoteSource: React.FunctionComponent<{}> = (props) => {
    return (
        <div
            css={css`
                margin-top: 1em;

                margin-left: 37px;
                p {
                    margin-block-start: 0;
                    margin-block-end: 0;
                }
                font-size: 0.8rem;
                font-weight: bold;
            `}
        >
            {props.children}
        </div>
    );
};

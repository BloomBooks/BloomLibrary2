// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { FormattedMessage } from "react-intl";

export const PageNotFound: React.FunctionComponent = () => (
    <div
        css={css`
            min-height: 300px;
            div {
                margin-left: auto;
                margin-right: auto;
                width: fit-content;
            }
            margin-top: 100px;

            font-size: 24px;
        `}
    >
        <div>Oops!</div>
        <br />
        <div>
            <FormattedMessage
                id="error.pageNotFound"
                defaultMessage="We can't seem to find the page you're looking for."
            />
        </div>
    </div>
);

import { css } from "@emotion/react";

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
            margin-left: 10px;
            margin-right: 10px;
            font-size: 24px;
            text-align: center;
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

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { BlorgLink as Link } from "../BlorgLink";
import { getAnchorProps } from "../../embedded";
import PrintIcon from "@material-ui/icons/Print";

export const HowToPrintButton: React.FunctionComponent = () => (
    <Link
        color="secondary"
        css={css`
            flex-shrink: 1;
            margin-right: 10px !important;
            display: flex;
            align-items: center;
            margin-top: 5px;
        `}
        onClick={() => alert("not implemented yet")}
        {...getAnchorProps("")}
    >
        <PrintIcon
            css={css`
                margin-right: 5px;
            `}
        />

        <div
            css={css`
                margin-top: 2px;
            `}
        >
            How to Make Print Versions
        </div>
    </Link>
);

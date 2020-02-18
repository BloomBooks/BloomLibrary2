// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { Book } from "../../model/Book";
import ReportIcon from "@material-ui/icons/Flag";
import { Button } from "@material-ui/core";

export const ReportButton: React.FunctionComponent<{
    book: Book;
}> = props => (
    <Button
        color="secondary"
        css={css`
            padding-left: 0 !important;
            justify-content: left !important;
        `}
        onClick={() => alert("not implemented yet")}
    >
        <ReportIcon />
        Report
    </Button>
);

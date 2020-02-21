// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { Book } from "../../model/Book";
import ReportIcon from "@material-ui/icons/Flag";
import { Link } from "@material-ui/core";

export const ReportButton: React.FunctionComponent<{
    book: Book;
}> = props => (
    // <Button
    //     color="secondary"
    //     css={css`
    //         padding-left: 0 !important;
    //         justify-content: left !important;
    //         margin-top: 2px;
    //     `}
    //     onClick={() => alert("not implemented yet")}
    // >
    <Link
        color="secondary"
        target="_blank"
        rel="noopener noreferrer" // copied from LicenseLink
        css={css`
            flex-shrink: 1;
            margin-right: 10px !important;
            display: flex;
            align-items: center;
            margin-top: 5px;
        `}
        onClick={() => alert("not implemented yet")}
    >
        <ReportIcon
            css={css`
                margin-right: 3px;
            `}
        />
        <div>Report</div>
    </Link>
);

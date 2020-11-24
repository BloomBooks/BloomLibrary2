// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { Book } from "../../model/Book";
import ReportIcon from "@material-ui/icons/Flag";
import { BlorgLink as Link } from "../BlorgLink";
import { getAnchorProps } from "../../embedded";
import { FormattedMessage } from "react-intl";
import { ReportDialog } from "./ReportDialog";

export const ReportButton: React.FunctionComponent<{
    book: Book;
    contextLangIso?: string;
}> = (props) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    return (
        <React.Fragment>
            <Link
                color="secondary"
                css={css`
                    flex-shrink: 1;
                    margin-right: 20px !important;
                    display: flex;
                    align-items: center;
                    margin-top: 10px !important;
                `}
                onClick={() => setDialogOpen(true)}
                {...getAnchorProps("")}
            >
                <ReportIcon
                    css={css`
                        margin-right: 3px;
                    `}
                />
                <div>
                    <FormattedMessage
                        id="book.report"
                        defaultMessage="Report"
                    />
                </div>
            </Link>
            <ReportDialog
                book={props.book}
                open={dialogOpen}
                close={() => {
                    setDialogOpen(false);
                }}
                contextLangIso={props.contextLangIso}
            />
        </React.Fragment>
    );
};

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { useGetBookDetail } from "../../connection/LibraryQueryHooks";
import { Book } from "../../model/Book";
import WarningIcon from "@material-ui/icons/Warning";
import { Button, IconButton, Divider } from "@material-ui/core";
import { Alert } from "../Alert";

import { observer } from "mobx-react";
import { BookExtraPanels } from "./BookExtraPanels";
import { MetadataGroup } from "./MetadataGroup";
import { ArtifactGroup } from "./ArtifactGroup";
import { BookDetailHeaderGroup } from "./BookDetailHeaderGroup";
import { ReportButton } from "./ReportButton";

interface IProps {
    id: string;
}
export const BookDetail: React.FunctionComponent<IProps> = props => {
    const book = useGetBookDetail(props.id);
    if (book === undefined) {
        return <div>Loading...</div>;
    } else if (book === null) {
        return <div>Sorry, we could not find that book.</div>;
    } else {
        return <BookDetailInternal book={book}></BookDetailInternal>;
    }
};

export const BookDetailInternal: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
    const showHarvesterWarning =
        props.book.harvesterLog.indexOf("Warning") >= 0;
    const divider = (
        <Divider
            css={css`
                margin-top: 10px !important;
                margin-bottom: 10px !important;
                background-color: rgba(29, 148, 164, 0.13) !important;
                height: 2px !important;
            `}
        />
    );
    const [alertText, setAlertText] = useState<string | null>(null);
    return (
        <div
            css={css`
                width: 800px;
                margin-left: auto;
                margin-right: auto;
                label: BookDetail;
            `}
        >
            <div
                css={css`
                    margin: 1em;
                `}
            >
                <BookDetailHeaderGroup book={props.book} />
                {divider}
                <MetadataGroup book={props.book} />
                {divider}
                <div
                    css={css`
                        display: flex;
                        justify-content: space-between;
                    `}
                >
                    <ReportButton book={props.book} />
                    <ArtifactGroup book={props.book} />
                </div>

                {showHarvesterWarning && (
                    <IconButton
                        aria-label="harvester warning"
                        onClick={() => setAlertText(props.book.harvesterLog)}
                    >
                        <WarningIcon />
                    </IconButton>
                )}

                <BookExtraPanels book={props.book} />
                <Alert
                    open={alertText != null}
                    close={() => {
                        setAlertText(null);
                    }}
                    message={alertText!}
                />
            </div>
        </div>
    );
});

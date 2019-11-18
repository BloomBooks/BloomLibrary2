import React, { Component, useEffect, useState } from "react";
import { BookCard } from "./BookCard";
import { css, cx } from "emotion";
import { useGetBookDetail } from "../connection/LibraryQueryHooks";
import WarningIcon from "@material-ui/icons/Warning";
import { IconButton } from "@material-ui/core";
import { Alert } from "./Alert";

interface IProps {
    id: string;
}
export const BookDetail: React.FunctionComponent<IProps> = props => {
    const book = useGetBookDetail(props.id);
    const [alertText, setAlertText] = useState<string | null>(null);

    if (!book) {
        return <div>Loading...</div>;
    } else {
        const showHarvesterWarning = book.harvesterLog.indexOf("Warning") >= 0;
        return (
            <div
                className={css`
                    width: 400px;
                    margin-left: auto;
                    margin-right: auto;
                `}
            >
                <h1
                    className={css`
                        font-size: 32pt;
                        margin-bottom: 12px;
                    `}
                >
                    {book.title}
                </h1>
                <div
                    className={css`
                        font-size: 14pt;
                        margin-bottom: 12px;
                    `}
                >
                    {book.summary}
                </div>
                <img
                    src={book.baseUrl + "thumbnail-256.png"}
                    className={css`
                        height: 300px;
                        object-fit: contain; //cover will crop, but fill up nicely
                    `}
                />
                <div>{book.credits}</div>
                <div>{book.copyright}</div>
                <div>
                    {"License: "}
                    {book.license}
                </div>
                <div>
                    {book.tags.map(t => {
                        const parts = t.split(":");
                        return parts[0] + "-" + parts[1];
                    })}
                </div>
                {showHarvesterWarning && (
                    <IconButton
                        aria-label="harvester warning"
                        onClick={() => setAlertText(book.harvesterLog)}
                    >
                        <WarningIcon />
                    </IconButton>
                )}
                <div
                    className={css`
                        margin-top: 300px;
                        color: lightgray;
                    `}
                >
                    <div>{"Raw Data:"}</div>
                    {JSON.stringify(book)}
                </div>

                {/* // This won't work yet because we don't have login working */}
                {/* <HarvesterArtifactUserControl bookId={props.id} /> */}

                <Alert
                    open={alertText != null}
                    close={() => {
                        setAlertText(null);
                    }}
                    message={alertText!}
                />
            </div>
        );
    }
};

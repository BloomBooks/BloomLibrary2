// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
import { HarvesterArtifactUserControl } from "../HarvesterArtifactUserControl/HarvesterArtifactUserControl";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { useGetBookDetail } from "../../connection/LibraryQueryHooks";
import WarningIcon from "@material-ui/icons/Warning";
import { IconButton, Divider } from "@material-ui/core";
import { Alert } from "../Alert";
import { spacing } from "@material-ui/system";
//NB: v3.0 of title-case has a new API, but don't upgrade: it doesn't actually work like v2.x does, where it can take fooBar and give us "Foo Bar"
import titleCase from "title-case";
import { ReadButton } from "./ReadButton";
import { TranslateButton } from "./TranslateButton";

interface IProps {
    id: string;
}
export const BookDetail: React.FunctionComponent<IProps> = props => {
    const book = useGetBookDetail(props.id);
    const [alertText, setAlertText] = useState<string | null>(null);
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
    if (book === undefined) {
        return <div>Loading...</div>;
    } else if (book === null) {
        return <div>Sorry, we could not find that book.</div>;
    } else {
        const showHarvesterWarning = book.harvesterLog.indexOf("Warning") >= 0;
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
                    <div
                        id={"primaryInfoAndButtons"}
                        css={css`
                            display: flex;
                            //background-color: lightgreen;
                        `}
                    >
                        <section
                            css={css`
                                display: flex;
                                margin-bottom: 1em;
                                flex-direction: column;
                                //  background-color: lightyellow;
                                width: 900px; //hack
                            `}
                        >
                            <div
                                id={"left-side"}
                                css={css`
                                    display: flex;
                                    margin-bottom: 1em;
                                `}
                            >
                                <img
                                    alt="book thumbnail"
                                    src={book.baseUrl + "thumbnail-256.png"}
                                    css={css`
                                        max-width: 125px;
                                        height: 120px;

                                        object-fit: contain; //cover will crop, but fill up nicely
                                        margin-right: 16px;
                                    `}
                                />
                                <div>
                                    <h1
                                        css={css`
                                            font-size: 18pt;
                                            margin-top: 0;
                                            margin-bottom: 12px;
                                        `}
                                    >
                                        {book.title}
                                    </h1>
                                    {/* These are the original credits, which aren't enough. See BL-7990
                    <div>{book.credits}</div> */}
                                    {/* <div>Written by: somebody</div>
                                    <div>Illustrated by: somebody</div>
                                    <div>Narrated by: somebody else</div> */}
                                    {/* <p
                                        css={css`
                                            white-space: pre-line;
                                        `}
                                    >
                                        {book.credits}
                                    </p> */}
                                </div>
                            </div>
                            <div
                                css={css`
                                    font-size: 14pt;
                                    margin-bottom: 12px;
                                `}
                            >
                                {book.summary}
                            </div>
                        </section>
                        <div id="twoButtons" css={css``}>
                            <ReadButton id={props.id} />
                            <TranslateButton id={props.id} />
                        </div>
                    </div>
                    {divider}
                    <div id={"details"}>
                        <div>{`${book.pageCount} Pages`}</div>
                        <div>{book.copyright}</div>
                        <div>
                            {"License: "}
                            {book.license}
                        </div>
                        <div>
                            {"Uploaded "}
                            {book.uploadDate}
                            {" by TODO"}
                        </div>
                        <div>
                            {"Last updated "}
                            {book.updateDate}
                        </div>
                        <div>
                            {"Tags: "}
                            {book.tags
                                .filter(t => !t.startsWith("system"))
                                .map(t => {
                                    const parts = t.split(":");
                                    return parts[1];
                                })
                                .join(", ")}
                        </div>
                        <div>
                            {"Features: "}
                            {book.features
                                ? book.features
                                      .map(f => {
                                          return titleCase(f);
                                      })
                                      .join(", ")
                                : []}
                        </div>
                    </div>
                    {divider}
                    {showHarvesterWarning && (
                        <IconButton
                            aria-label="harvester warning"
                            onClick={() => setAlertText(book.harvesterLog)}
                        >
                            <WarningIcon />
                        </IconButton>
                    )}
                    <div
                        css={css`
                            margin-top: 300px;
                            color: lightgray;
                        `}
                    >
                        <div>{"Raw Data:"}</div>
                        {JSON.stringify(book)}
                    </div>

                    {/* Todo: this should only be shown if the owner of the book is currently authorized */}
                    <HarvesterArtifactUserControl bookId={props.id} />

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
    }
};

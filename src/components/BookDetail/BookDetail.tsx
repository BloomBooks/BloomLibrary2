// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { useGetBookDetail } from "../../connection/LibraryQueryHooks";
import { Book } from "../../model/Book";
import WarningIcon from "@material-ui/icons/Warning";
import { IconButton, Divider } from "@material-ui/core";
import { Alert } from "../Alert";

//NB: v3.0 of title-case has a new API, but don't upgrade: it doesn't actually work like v2.x does, where it can take fooBar and give us "Foo Bar"
import titleCase from "title-case";
import { ReadButton } from "./ReadButton";
import { TranslateButton } from "./TranslateButton";
import { observer } from "mobx-react";
import { BookExtraPanels } from "./BookExtraPanels";
import { LicenseLink } from "./LicenseLink";

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
                                src={props.book.baseUrl + "thumbnail-256.png"}
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
                                    {props.book.title}
                                </h1>
                                {/* These are the original credits, which aren't enough. See BL-7990
                    <div>{props.book.credits}</div> */}
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
                            {props.book.summary}
                        </div>
                    </section>
                    <div
                        id="twoButtons"
                        css={css`
                            flex-shrink: 2;
                        `}
                    >
                        <ReadButton id={props.book.id} />
                        <TranslateButton id={props.book.id} />
                    </div>
                </div>
                {divider}
                <div
                    id={"details"}
                    css={css`
                        display: flex;
                    `}
                >
                    <div
                        id="column1"
                        css={css`
                            flex-grow: 1;
                        `}
                    >
                        <div>{`${props.book.pageCount} Pages`}</div>
                        <div>{props.book.copyright}</div>
                        <div>
                            {"License: "}
                            <LicenseLink book={props.book} />
                        </div>
                        <div>
                            {"Uploaded "}
                            {`${props.book.uploadDate!.toLocaleDateString()} by ${obfuscateEmail(
                                props.book.uploader
                            )}`}
                        </div>
                        <div>{`Last updated on ${props.book.updateDate!.toLocaleDateString()}`}</div>
                        {props.book.originalBookSourceUrl &&
                            props.book.originalBookSourceUrl.length > 0 && (
                                <div>
                                    Imported from&nbsp;
                                    <a href={props.book.originalBookSourceUrl}>
                                        {
                                            new URL(
                                                props.book.originalBookSourceUrl
                                            ).host
                                        }
                                    </a>
                                </div>
                            )}
                    </div>
                    <div
                        id="column2"
                        css={css`
                            width: 250px;
                        `}
                    >
                        <div>
                            {"Features: "}
                            {props.book.features
                                ? props.book.features
                                      .map(f => {
                                          return titleCase(f);
                                      })
                                      .join(", ")
                                : []}
                        </div>
                        <div>
                            {"Tags: "}
                            {props.book.tags
                                .filter(t => !t.startsWith("system"))
                                .map(t => {
                                    const parts = t.split(":");
                                    return parts[1];
                                })
                                .join(", ")}
                        </div>
                    </div>
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

function obfuscateEmail(user: any): string {
    const email = user.username;
    if (!email) {
        return "";
    }
    const index = email.lastIndexOf("@");
    if (index < 0 || index + 1 >= email.length) {
        return email;
    }
    return email.substring(0, index + 1) + "...";
}

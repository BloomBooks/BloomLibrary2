// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState, useContext } from "react";
import { useGetBookDetail } from "../../connection/LibraryQueryHooks";
import { Book } from "../../model/Book";
import WarningIcon from "@material-ui/icons/Warning";
import TranslationIcon from "./translation.svg";
import { IconButton, Divider, Link } from "@material-ui/core";
import { Alert } from "../Alert";

import { observer, PropTypes } from "mobx-react";
import { BookExtraPanels } from "./BookExtraPanels";
import { MetadataGroup } from "./MetadataGroup";
import { ArtifactGroup } from "./ArtifactGroup";
import { BookDetailHeaderGroup } from "./BookDetailHeaderGroup";
import { ReportButton } from "./ReportButton";
import { OSFeaturesContext } from "../../components/OSFeaturesContext";
import { commonUI } from "../../theme";
import { Breadcrumbs } from "../Breadcrumbs";
import { useTrack } from "../../Analytics";
import { splitPathname, useDocumentTitle } from "../Routes";

interface IProps {
    id: string;
    prefixes?: string;
}
const BookDetail: React.FunctionComponent<IProps> = (props) => {
    const id = props.id;
    const book = useGetBookDetail(id);
    const contextLangIso = getContextLang(props.prefixes);
    useDocumentTitle("About - " + book?.title);
    useTrack(
        "Book Detail",
        getBookDetailsParams(book, contextLangIso, undefined, props.prefixes),
        !!book
    );
    if (book === undefined) {
        return <div>Loading...</div>;
    } else if (book === null) {
        return <div>Sorry, we could not find that book.</div>;
    } else {
        return (
            <React.StrictMode>
                <BookDetailInternal
                    book={book}
                    contextLangIso={contextLangIso}
                ></BookDetailInternal>
            </React.StrictMode>
        );
    }
};

function getContextLang(prefixes?: string): string | undefined {
    if (!prefixes) {
        return undefined;
    }
    const parts = prefixes.split("/");
    const langPart = parts.find((x) => x.startsWith("language:"));
    if (!langPart) {
        return undefined;
    }
    return langPart.substring("language:".length);
}

export interface IBookAnalyticsParams {
    bookID?: string;
    title?: string;
    publisher?: string;
    topic?: string;
    level?: string;
    language?: string;
    type?: string;
    source?: string;
    bookInstanceId?: string;
}

export function getBookDetailsParams(
    book: Book | null | undefined,
    lang: string | undefined,
    type: string | undefined,
    prefixes?: string
): IBookAnalyticsParams {
    const topicTag = (book?.tags || []).find((x) => x.startsWith("topic:"));
    const topic = topicTag ? topicTag.substring("topic:".length) : "";
    let level = book?.level;
    if (!level) {
        const computedLevelTag = (book?.tags || []).find((x) =>
            x.startsWith("computedLevel:")
        );
        if (computedLevelTag) {
            level = computedLevelTag.substring("computedLevel:".length);
        }
    }
    const result: IBookAnalyticsParams = {
        bookID: book?.id,
        title: book?.title,
        publisher: book?.publisher,
        topic,
        level,
        bookInstanceId: book?.bookInstanceId,
    };
    if (lang) {
        result.language = lang;
    }
    if (type) {
        result.type = type;
    }
    if (prefixes) {
        // The idea here is that our spec calls for the pathname
        // not to include breadcrumbs, that is, it should just indicate
        // the collection, including any filters.
        // The split extracts the collectionName, and then we re-attach the filters.
        // However, currently, I believe book detail is never invoked
        // with a url including either breadcrumbs or filters, just {/collection urlkey}/book/id.
        // So we'd get the same result (but be less future-proof)
        // by ust setting result.source to filters.
        const { collectionName, filters } = splitPathname(prefixes);
        const pathParts = filters.map((x) => ":" + x);
        pathParts.splice(0, 0, collectionName);
        result.source = pathParts.join("/");
    }
    return result;
}

export const BookDetailInternal: React.FunctionComponent<{
    book: Book;
    contextLangIso?: string;
}> = observer((props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bloomDesktopAvailable, bloomReaderAvailable } = useContext(
        OSFeaturesContext
    );
    const showHarvesterWarning =
        props.book.getHarvestLog().indexOf("Warning") >= 0;
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
    const breakToColumn = "540px";

    return (
        <div
            // had width:800px, but that destroys responsiveness
            css={css`
                margin-left: auto;
                margin-right: auto;
                label: BookDetail;
                max-width: 800px;
            `}
        >
            <div
                css={css`
                    a,
                    a:visited {
                        color: black;
                    }
                `}
            >
                <Breadcrumbs />
            </div>
            <div
                css={css`
                    margin: ${commonUI.detailViewMargin};
                `}
            >
                <BookDetailHeaderGroup
                    book={props.book}
                    breakToColumn={breakToColumn}
                    contextLangIso={props.contextLangIso}
                />
                {props.book.inCirculation || (
                    <div
                        css={css`
                            background-color: orange;
                        `}
                    >
                        <h1>
                            BLOOM STAFF HAVE REMOVED THIS BOOK FROM CIRCULATION
                            IN THE LIBRARY
                        </h1>
                        <p>
                            For more information, write to{" "}
                            <a href="mailto:librarian@bloomlibrary.org">
                                librarian@bloomlibrary.org
                            </a>
                        </p>
                    </div>
                )}
                {divider}
                <MetadataGroup
                    book={props.book}
                    breakToColumn={breakToColumn}
                />
                {divider}
                <div
                    css={css`
                        display: flex;
                        justify-content: space-between;
                    `}
                >
                    <div
                        css={css`
                            display: flex;
                            width: 100%;
                            justify-content: space-between;
                            flex-wrap: wrap;
                            align-items: center;
                            @media (max-width: ${breakToColumn}) {
                                flex-direction: column-reverse;
                                align-items: flex-start;
                            }
                        `}
                    >
                        <ReportButton
                            book={props.book}
                            css={css`
                                margin-right: auto;
                                justify-content: left;
                            `}
                        />

                        {/* Enhance, maybe, add this and wire to some message <HowToPrintButton />*/}
                        {bloomDesktopAvailable || (
                            <Link
                                color="secondary"
                                target="_blank"
                                rel="noopener noreferrer" // copied from LicenseLink
                                href="https://bloomlibrary.org/HowToTranslate.htm"
                                css={css`
                                    flex-shrink: 1;
                                    margin-right: 10px !important;
                                `}
                            >
                                <div
                                    css={css`
                                        display: flex;
                                        align-items: center;
                                    `}
                                >
                                    <img
                                        alt="Download Translation Icon"
                                        src={TranslationIcon}
                                        css={css`
                                            margin-right: 9px;
                                        `}
                                    />
                                    <div
                                        css={css`
                                            margin-top: 10px;
                                        `}
                                    >
                                        How to translate
                                    </div>
                                </div>
                            </Link>
                        )}
                        <ArtifactGroup book={props.book} />
                    </div>
                </div>

                {showHarvesterWarning && (
                    <IconButton
                        aria-label="harvester warning"
                        onClick={() => setAlertText(props.book.getHarvestLog())}
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

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default BookDetail;

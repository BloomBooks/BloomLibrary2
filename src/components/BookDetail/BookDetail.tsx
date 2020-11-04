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

import { observer } from "mobx-react";
import { BookExtraPanels } from "./BookExtraPanels";
import { MetadataGroup } from "./MetadataGroup";
import { ArtifactGroup } from "./ArtifactGroup";
import { BookDetailHeaderGroup } from "./BookDetailHeaderGroup";
import { DeleteButton } from "./DeleteButton";
import { ReportButton } from "./ReportButton";
import { OSFeaturesContext } from "../../components/OSFeaturesContext";
import { commonUI } from "../../theme";
import { Breadcrumbs } from "../Breadcrumbs";
import { useTrack } from "../../analytics/Analytics";
import { splitPathname, useDocumentTitle } from "../Routes";
import { useLocation } from "react-router-dom";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { FormattedMessage, useIntl } from "react-intl";
import { FeaturesGroup } from "./FeaturesGroup";

interface IProps {
    id: string;
}
const BookDetail: React.FunctionComponent<IProps> = (props) => {
    const l10n = useIntl();
    const id = props.id;
    const book = useGetBookDetail(id);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const contextLangIso = getContextLang(query);
    useDocumentTitle(
        l10n.formatMessage(
            {
                id: "book.detail.tabLabel",
                defaultMessage: "About - {title}",
            },
            { title: book?.title }
        )
    );
    const { collectionName } = splitPathname(location.pathname);
    useTrack(
        "Book Detail",
        getBookAnalyticsInfo(book, contextLangIso, undefined, collectionName),
        !!book
    );
    if (book === undefined) {
        return (
            <div>
                <FormattedMessage id="loading" defaultMessage="Loading..." />
            </div>
        );
    } else if (book === null) {
        return (
            <div>
                <FormattedMessage
                    id="error.cantFind"
                    defaultMessage="Sorry, we could not find that book."
                />
            </div>
        );
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

function getContextLang(query: URLSearchParams): string | undefined {
    const lang = query.get("lang");
    if (lang) {
        return lang;
    }
    return undefined;
}

export const BookDetailInternal: React.FunctionComponent<{
    book: Book;
    contextLangIso?: string;
}> = observer((props) => {
    const l10n = useIntl();
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
    const embeddedMode = window.location.pathname.startsWith("/embed/");
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
                {embeddedMode || <Breadcrumbs />}
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
                <FeaturesGroup
                book={props.book}/>
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
                        <div
                            css={css`
                                display: flex;
                            `}
                        >
                            <ReportButton book={props.book} />
                            <DeleteButton book={props.book} />
                        </div>
                        {/* Enhance, maybe, add this and wire to some message <HowToPrintButton />*/}
                        {/* This link is supposed to be an explanation of how to get Bloom desktop etc.
                        so you can translate the book. A such only needed where the Translate button
                        is missing, e.g., mobile and Mac. But we haven't created the page it should link
                        to yet, so we're not showing it anywhere.
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
                                        alt={l10n.formatMessage({
                                            id:
                                                "book.detail.translateButton.downloadIcon",
                                            defaultMessage:
                                                "Download Translation Icon",
                                        })}
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
                                        <FormattedMessage
                                            id="book.detail.howToTranslate"
                                            defaultMessage="How to translate"
                                        />
                                    </div>
                                </div>
                            </Link>
                        )} */}
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

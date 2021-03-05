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

import { observer } from "mobx-react-lite";
import { BookExtraPanels } from "./BookExtraPanels";
import { LeftMetadata, RightMetadata } from "./MetadataGroup";
import { DownloadsGroup } from "./DownloadsGroup";
import { BookDetailHeaderGroup } from "./BookDetailHeaderGroup";
import { DeleteButton } from "./DeleteButton";
import { ReportButton } from "./ReportButton";
import { Breadcrumbs } from "../Breadcrumbs";
import { useTrack } from "../../analytics/Analytics";
import { splitPathname, useSetBrowserTabTitle } from "../Routes";
import { useLocation } from "react-router-dom";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { FormattedMessage, useIntl } from "react-intl";
import { FeaturesGroup } from "./FeaturesGroup";
import { useIsEmbedded } from "../EmbeddingHost";
import { commonUI } from "../../theme";
import { IBookDetailProps } from "./BookDetailCodeSplit";

const BookDetail: React.FunctionComponent<IBookDetailProps> = (props) => {
    const l10n = useIntl();
    const id = props.id;
    const book = useGetBookDetail(id);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const contextLangIso = getContextLang(query);
    const bestTitle = book ? book.getBestTitle(contextLangIso) : "";
    useSetBrowserTabTitle(
        l10n.formatMessage(
            {
                id: "book.detail.tabLabel",
                defaultMessage: "About - {title}",
            },
            { title: bestTitle }
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

const BookDetailInternal: React.FunctionComponent<{
    book: Book;
    contextLangIso?: string;
}> = observer((props) => {
    // const { bloomDesktopAvailable } = useContext(
    //     OSFeaturesContext
    // );
    const showHarvesterWarning =
        props.book.getHarvestLog().indexOf("Warning") >= 0;
    const divider = (
        <Divider
            css={css`
                margin-top: 10px !important;
                margin-bottom: 10px !important;
                background-color: ${commonUI.colors.bloomBlue}21 !important;
                height: 2px !important;
            `}
        />
    );
    const [alertText, setAlertText] = useState<string | null>(null);

    const embeddedMode = useIsEmbedded();
    return (
        <div
            // had width:800px, but that destroys responsiveness
            css={css`
                margin-left: auto;
                margin-right: auto;
                // the left/right auto margins are great but when the screen is small and we go to zero, we still want a little margin,
                // so we add this padding. And the top padding looks good anyhow. The "1em" is arbitrary, though.
                padding: 1em;
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
            <div>
                <BookDetailHeaderGroup
                    book={props.book}
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
                <Detail2ColumnRow>
                    <FeaturesGroup book={props.book} />
                    <DownloadsGroup book={props.book} />
                </Detail2ColumnRow>
                {divider}
                <Detail2ColumnRow>
                    <LeftMetadata book={props.book} />
                    <RightMetadata book={props.book} />
                </Detail2ColumnRow>
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
                            @media (max-width: ${commonUI.detailViewBreakpointForTwoColumns}) {
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
                            <ReportButton
                                book={props.book}
                                contextLangIso={props.contextLangIso}
                            />
                            <DeleteButton book={props.book} />
                        </div>
                        {/* Enhance, maybe, add this and wire to some message <HowToPrintButton />*/}
                        {/* This link is supposed to be an explanation of how to get Bloom desktop etc.
                        so you can translate the book. A such only needed where the Translate button
                        is missing, e.g., mobile and Mac. But we haven't created the page it should link
                        to yet, so we're not showing it anywhere.
                        (bloomDesktopAvailable definition is commented above)
                            {bloomDesktopAvailable || (
                            <BlorgLink
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
                            </BlorgLink>
                        )} */}
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

// Shows two groups side by side, unless the screen is too narrow.
// This is used by both the feature/download section and the metadata, so that
// the second column in each has the same left edge.
const Detail2ColumnRow: React.FunctionComponent<
    React.HTMLProps<HTMLDivElement>
> = (props) => {
    return (
        <div
            css={css`
                display: flex;
                justify-content: space-between;
                max-width: calc(100vw - ${commonUI.detailViewMargin}*2);
                @media (max-width: ${commonUI.detailViewBreakpointForTwoColumns}) {
                    flex-direction: column-reverse;
                }
            `}
        >
            <div
                css={css`
                    margin-right: 10px; // when the screen is getting thinner, keep some distance from the right column
                `}
            >
                {React.Children.toArray(props.children)[0]}
            </div>
            <div
                css={css`
                    width: 300px;
                `}
            >
                {React.Children.toArray(props.children)[1]}
            </div>
        </div>
    );
};

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default BookDetail;

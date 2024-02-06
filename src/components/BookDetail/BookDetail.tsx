// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useRef } from "react";
import { useGetBookDetail } from "../../connection/LibraryQueryHooks";
import { Book } from "../../model/Book";

import { Button, Checkbox, Divider, FormControlLabel } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import { observer } from "mobx-react-lite";
import { BookExtraPanels } from "./BookExtraPanels";
import { LeftMetadata, RightMetadata } from "./MetadataGroup";
import { DownloadsGroup } from "./DownloadsGroup";
import { BookDetailHeaderGroup } from "./BookDetailHeaderGroup";
import { DeleteButton } from "./DeleteButton";
import { ReportButton } from "./ReportButton";
import { Breadcrumbs } from "../Breadcrumbs";
import { useTrack } from "../../analytics/Analytics";
import {
    splitPathname,
    useSetBrowserTabTitle,
    getContextLangTagFromUrlSearchParams,
} from "../Routes";
import { useLocation } from "react-router-dom";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { FormattedMessage, useIntl } from "react-intl";
import { FeaturesGroup } from "./FeaturesGroup";
import { useIsEmbedded } from "../EmbeddingHost";
import { commonUI } from "../../theme";
import { IBookDetailProps } from "./BookDetailCodeSplit";
import { HarvesterProgressNotice } from "./HarvestProgressNotice";
import { LoggedInUser } from "../../connection/LoggedInUser";
import { ReactComponent as DraftIcon } from "../../assets/DRAFT-Stamp.svg";
import { useResponsiveChoice } from "../../responsiveUtilities";
import { HarvesterProblemNotice } from "./HarvesterProblemNotice";
import { SharingButtons } from "./SharingButtons";
import { addExternalParamToUrl, BlorgLink } from "../BlorgLink";
import {
    removeAppHostedFromPath,
    useIsAppHosted,
} from "../appHosted/AppHostedUtils";
import { Helmet } from "react-helmet";
import { DownloadToBloomDialogs } from "./DownloadToBloomButton";

const BookDetail: React.FunctionComponent<IBookDetailProps> = (props) => {
    const l10n = useIntl();
    const id = props.id;
    const book = useGetBookDetail(id);
    const location = useLocation();
    const contextLangTag = getContextLangTagFromUrlSearchParams(
        new URLSearchParams(location.search)
    );
    const bestTitle = book ? book.getBestTitle(contextLangTag) : "";
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
        getBookAnalyticsInfo(book, contextLangTag, undefined, collectionName),
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
                    contextLangTag={contextLangTag}
                ></BookDetailInternal>
            </React.StrictMode>
        );
    }
};

// This constant lets us keep active some code we don't want to take effect
// until Bloom 5.7 is shipping. I don't want to comment it out because I want
// it to continue to keep up to date. Also, a single line here can just be changed here to enable it.
// The true/false tricks lint into not complaining about unreachable code.
let bloom57IsShipping = true;
bloom57IsShipping = false;

const BookDetailInternal: React.FunctionComponent<{
    book: Book;
    contextLangTag?: string;
}> = observer((props) => {
    // const { bloomDesktopAvailable } = useContext(
    //     OSFeaturesContext
    // );

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
    const embeddedMode = useIsEmbedded();
    const appHostedMode = useIsAppHosted();
    const user = LoggedInUser.current;
    const userIsUploader = user?.username === props.book.uploader?.username;
    const l10n = useIntl();
    const getResponsiveChoice = useResponsiveChoice();
    const showDownloadDialog = useRef<() => void | undefined>();
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
                box-sizing: border-box;
                ${appHostedMode ? "height: 100%;" : ""}
            `}
        >
            {appHostedMode && (
                <Helmet>
                    {/* &#65279; is U+FEFF ZERO WIDTH NO-BREAK SPACE which gives us nothing visible.
                    Trying to set title to nothing results in an ugly browser default, showing part of the url.
                    In this case, we want nothing because in the host app, the book title is already the thing at the top of the screen */}
                    <title>&#65279;</title>
                </Helmet>
            )}
            <div
                css={css`
                    a,
                    a:visited {
                        color: black;
                    }
                `}
            >
                {embeddedMode || appHostedMode || <Breadcrumbs />}
            </div>
            <div
                // position is relative so this is the basis div for absolutely positioning the DRAFT overlay
                css={css`
                    position: relative;
                    box-sizing: border-box;
                    ${appHostedMode
                        ? "height: 100%; display: flex; flex-direction: column;"
                        : ""}
                `}
            >
                <BookDetailHeaderGroup
                    book={props.book}
                    contextLangTag={props.contextLangTag}
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
                <HarvesterProgressNotice book={props.book} />
                <HarvesterProblemNotice book={props.book} />
                {appHostedMode ? (
                    <React.Fragment>
                        <div
                            css={css`
                                flex-grow: 1;
                            `}
                        />
                        <BlorgLink
                            css={css`
                                color: black;
                                text-decoration: underline;
                                margin-top: auto;
                            `}
                            // We want the hosting app to handle this link so it can route it to an external browser.
                            // Therefore, we need BlorgLink to treat it like an external link (i.e. not use our SPA router).
                            // By ensuring the link starts with http(s), we get the desired behavior.
                            href={addExternalParamToUrl(
                                removeAppHostedFromPath(window.location.href)
                            )}
                        >
                            {l10n.formatMessage({
                                id: "appHosted.detailsOnBlorg",
                                defaultMessage: "Details on BloomLibrary.org",
                            })}
                        </BlorgLink>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
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
                                    <SharingButtons book={props.book} />
                                    <ReportButton
                                        book={props.book}
                                        contextLangTag={props.contextLangTag}
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
                        {(user?.moderator || userIsUploader) && (
                            <FormControlLabel
                                css={css`
                                    margin-top: 15px;
                                    // By default, the checkbox has some padding used for animations on hover etc.
                                    // And then, apparently a corresponding negative margin on this control makes it look
                                    // aligned left. I think the amount of both is 8px. So a margin of -5px actually INCREASES
                                    // the indent, aligning it with the 3px that something indents the Report button icon.
                                    margin-left: -5px;
                                `}
                                control={
                                    <Checkbox
                                        css={css`
                                            padding-top: 0;
                                            margin-right: -5px;
                                            padding-right: 1px;
                                        `}
                                        checked={props.book.draft}
                                        onChange={(e) => {
                                            props.book.draft = e.target.checked;
                                            props.book.saveAdminDataToParse();
                                        }}
                                    />
                                }
                                label={
                                    <div
                                        css={css`
                                            display: flex;
                                        `}
                                    >
                                        <DraftIcon
                                            css={css`
                                                width: 54px;
                                            `}
                                        />
                                        <div>
                                            {l10n.formatMessage({
                                                id:
                                                    "book.detail.draftDescription",
                                                defaultMessage:
                                                    "Do not show this book to the public yet. I will share its URL with reviewers for feedback.",
                                                description:
                                                    "Label for a check box which, if checked, marks the book as 'DRAFT' and prevents the book from showing in most views",
                                            })}
                                        </div>
                                    </div>
                                }
                            />
                        )}
                        {props.book.draft && (
                            <DraftIcon
                                css={css`
                                    width: 261px;
                                    height: 197px;
                                    position: absolute;
                                    left: ${getResponsiveChoice(120, 180)}px;
                                    top: ${getResponsiveChoice(-26, -12)}px;
                                `}
                            />
                        )}
                        {userIsUploader && (
                            <div
                                css={css`
                                    display: flex;
                                    flex-direction: column;
                                `}
                            >
                                <h2
                                    css={css`
                                        margin-bottom: 0;
                                        color: ${commonUI.colors.bloomBlue};
                                    `}
                                    id="book.detail.editing"
                                >
                                    Editing
                                </h2>
                                <Alert severity="info">
                                    <div>
                                        <FormattedMessage
                                            id={"book.detail.updateBookNotice"}
                                            defaultMessage={
                                                "If you want to update this book with any changes, just upload it again from Bloom, using the same account. Your new version will replace this one."
                                            }
                                        />
                                    </div>
                                    {bloom57IsShipping && (
                                        <div
                                            css={css`
                                                margin-top: 10px;
                                            `}
                                        >
                                            <FormattedMessage
                                                id={
                                                    "book.detail.getForEditBookNotice"
                                                }
                                                defaultMessage={
                                                    "If necessary, we can give you the book to edit in Bloom. You must first have Bloom 5.7 or greater installed ({downloadLink})"
                                                }
                                                values={{
                                                    downloadLink: (
                                                        <BlorgLink
                                                            href="page/create/downloads"
                                                            css={css`
                                                                color: ${commonUI
                                                                    .colors
                                                                    .bloomBlue};
                                                            `}
                                                        >
                                                            <FormattedMessage
                                                                id={
                                                                    "book.detail.downloadBloom"
                                                                }
                                                                defaultMessage={
                                                                    "Download Bloom"
                                                                }
                                                            />
                                                        </BlorgLink>
                                                    ),
                                                }}
                                            />
                                        </div>
                                    )}
                                </Alert>
                                {bloom57IsShipping && (
                                    <Button
                                        onClick={() =>
                                            showDownloadDialog.current?.()
                                        }
                                        color="secondary"
                                        variant="outlined"
                                        css={css`
                                            align-self: flex-end;
                                            margin-top: 5px;
                                        `}
                                    >
                                        <FormattedMessage
                                            id={"book.detail.editDownload"}
                                            defaultMessage={
                                                "Download into Bloom for editing"
                                            }
                                        />
                                    </Button>
                                )}
                            </div>
                        )}
                        <BookExtraPanels book={props.book} />
                        <DownloadToBloomDialogs
                            book={props.book}
                            getShowFunction={(download) =>
                                (showDownloadDialog.current = download)
                            }
                            forEdit={true}
                        />
                    </React.Fragment>
                )}
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

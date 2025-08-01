import { css } from "@emotion/react";

import React, { useContext } from "react";
import { Book } from "../../model/Book";
import { ArtifactType } from "./ArtifactHelper";
import { observer } from "mobx-react-lite";
import { ReadButton } from "./ReadButton";
import { LanguageLabel, LanguageLink } from "../LanguageLink";
import { getArtifactVisibilitySettings } from "./ArtifactHelper";
import { ILanguage } from "../../model/Language";
import { ReadOfflineButton } from "./ReadOfflineButton";
import { useMediaQuery } from "@material-ui/core";
import { OSFeaturesContext } from "../../components/OSFeaturesContext";
import { commonUI } from "../../theme";
import { useGetBookCountRaw } from "../../connection/LibraryQueryHooks";
import { getResultsOrMessageElement } from "../../connection/GetQueryResultsUI";
import { useIsEmbedded } from "../Embedding/EmbeddingHost";
import { FormattedMessage } from "react-intl";
import { BookThumbnail } from "./BookThumbnail";
import { BlorgLink } from "../BlorgLink";
import { DownloadToBloomButton } from "./DownloadToBloomButton";
import { GetBloomReaderButton } from "./GetBloomReaderButton";
import { AppHostedDownloadButton } from "../appHosted/AppHostedDownloadButton";
import { useIsAppHosted } from "../appHosted/AppHostedUtils";

export const BookDetailHeaderGroup: React.FunctionComponent<{
    book: Book;
    // sometimes in the UI, we know what language the user is interested in,
    //so where possible we're going to preference that if this is a multilingual book
    contextLangTag?: string;
}> = observer((props) => {
    const isEmbedded = useIsEmbedded();
    const { bloomDesktopAvailable, bloomReaderAvailable } = useContext(
        OSFeaturesContext
    );
    const appHostedMode = useIsAppHosted();
    const readOnlineSettings = getArtifactVisibilitySettings(
        props.book,
        ArtifactType.readOnline
    );

    const phash = props.book.phashOfFirstContentImage;
    const sanitizedPhashOfFirstContentImage =
        phash && phash.trim() && phash.trim() !== "null"
            ? phash.trim()
            : "Not A Valid Phash";
    const bookHash = props.book.bookHashFromImages;
    const sanitizedBookHashFromImages =
        bookHash && bookHash.trim() && bookHash.trim() !== "null"
            ? bookHash.trim()
            : null;
    const searchCriteria = sanitizedBookHashFromImages
        ? { search: "bookHash:" + sanitizedBookHashFromImages }
        : { search: "phash:" + sanitizedPhashOfFirstContentImage };
    // const searchCriteria = {
    //     search: "phash:" + sanitizedPhashOfFirstContentImage,
    // };
    const answer = useGetBookCountRaw(searchCriteria);
    const countOfBooksWithMatchingPhash =
        getResultsOrMessageElement(answer).count - 1;

    // Show this button if the harvester made an artifact we can read online,
    // and no one decided it was not fit to use.
    const showReadOnLine =
        readOnlineSettings &&
        readOnlineSettings.decision &&
        props.book.harvestState === "Done";
    const shellBookSettings = getArtifactVisibilitySettings(
        props.book,
        ArtifactType.shellbook
    );
    const showTranslateButton =
        !isEmbedded && // BL-8698, at this point, people embed BL to publish books, not encourage translation.
        shellBookSettings &&
        shellBookSettings.decision && // it's OK to download and translate the book
        !appHostedMode && // bloomDesktopAvailable would block this normally, but when simulating on a desktop this makes sure.
        bloomDesktopAvailable; // and this platform can run the software for doing it

    const bloomReaderSettings = getArtifactVisibilitySettings(
        props.book,
        ArtifactType.bloomReader
    );

    const allowBloomPUBDownload =
        props.book.harvestState === "Done" &&
        bloomReaderSettings && // harvester made a bloomd
        bloomReaderSettings.decision && // no one decided it was not fit to use
        bloomReaderAvailable; // and we're on a platform that supports bloom reader
    const showBloomReaderButton =
        allowBloomPUBDownload &&
        // If we're embedded inside BR, we show a different Download button for the book
        // and don't offer to install BR!
        !appHostedMode;
    const showAppHostedDownloadButton = allowBloomPUBDownload && appHostedMode;

    const fullWidthButtons = useMediaQuery(
        `(max-width:${commonUI.detailViewBreakpointForTwoColumns})`
    );

    return (
        <div
            id={"primaryInfoAndButtons"}
            // the flex box grows to the width of its parent, which is determined
            // by the widest child, which may be wider than the viewport.
            // Here we limit this control to not grow wider than the viewport.
            css={css`
                display: flex;
                justify-content: space-between;
                max-width: calc(100vw - ${commonUI.detailViewMargin}*2);
                @media (max-width: ${commonUI.detailViewBreakpointForTwoColumns}) {
                    flex-direction: column;
                }
            `}
        >
            <section
                css={css`
                    display: flex;
                    margin-bottom: 1em;
                    flex-direction: column;
                    margin-right: 1em;
                    @media (max-width: ${commonUI.detailViewBreakpointForTwoColumns}) {
                        margin-right: 0;
                    }
                `}
            >
                <div
                    id={"left-side"}
                    css={css`
                        display: flex;
                        margin-bottom: 1em;
                    `}
                >
                    <BookThumbnail book={props.book} />
                    <div>
                        <h1
                            css={css`
                                font-size: 18pt;
                                margin-top: 0;
                                margin-bottom: 12px;
                            `}
                        >
                            {props.book.getBestTitle(props.contextLangTag)}
                            {props.book.edition ? (
                                <div
                                    css={css`
                                        font-size: 12pt;
                                        font-style: italic;
                                        text-transform: capitalize;
                                    `}
                                >
                                    {props.book.edition}
                                </div>
                            ) : undefined}
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
                        {(props.book.languages &&
                            props.book.languages.length && (
                                <ul
                                    css={css`
                                        list-style: none;
                                        padding: 0;
                                    `}
                                >
                                    {props.book.languages.map(
                                        (l: ILanguage) => (
                                            <li key={l.isoCode}>
                                                {appHostedMode ? (
                                                    <LanguageLabel
                                                        language={l}
                                                    />
                                                ) : (
                                                    <LanguageLink
                                                        language={l}
                                                    />
                                                )}
                                            </li>
                                        )
                                    )}

                                    {!appHostedMode &&
                                        countOfBooksWithMatchingPhash > 0 && (
                                            <li>
                                                <BlorgLink
                                                    css={css`
                                                        font-size: 9pt;
                                                    `}
                                                    newTabIfEmbedded={true}
                                                    color="secondary"
                                                    href={
                                                        sanitizedBookHashFromImages
                                                            ? `/bookHash:${sanitizedBookHashFromImages}`
                                                            : `/phash:${sanitizedPhashOfFirstContentImage}`
                                                    }
                                                >
                                                    <FormattedMessage
                                                        id="book.detail.translations"
                                                        defaultMessage="{count} books that may be translations"
                                                        values={{
                                                            count: countOfBooksWithMatchingPhash,
                                                        }}
                                                    />
                                                </BlorgLink>
                                            </li>
                                        )}
                                </ul>
                            )) || (
                            <FormattedMessage
                                id="book.detail.pictureBook"
                                defaultMessage="Picture Book (no text)"
                            />
                        )}
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
                // using display:flex because the button styles work out to inline,
                // so display:block will try to make a row out of them, then the parent element's
                // flex layout results in shrinking other things to make room for them as a row...
                // it was very confusing.
                css={css`
                    flex-shrink: 2;
                    display: flex;
                    flex-direction: column;
                `}
            >
                {showAppHostedDownloadButton && (
                    <AppHostedDownloadButton
                        css={css`
                            margin-top: 20px;
                            margin-bottom: 20px;
                        `}
                        book={props.book}
                        fullWidth={fullWidthButtons}
                        contextLangTag={props.contextLangTag}
                    />
                )}
                {showReadOnLine && (
                    <ReadButton
                        book={props.book}
                        fullWidth={fullWidthButtons}
                        contextLangTag={props.contextLangTag}
                    />
                )}
                {showTranslateButton && (
                    <DownloadToBloomButton
                        book={props.book}
                        fullWidth={fullWidthButtons}
                        contextLangTag={props.contextLangTag}
                    />
                )}
                {showBloomReaderButton && (
                    <>
                        <ReadOfflineButton
                            book={props.book}
                            fullWidth={fullWidthButtons}
                            contextLangTag={props.contextLangTag}
                        />
                        <GetBloomReaderButton fullWidth={fullWidthButtons} />
                    </>
                )}
            </div>
        </div>
    );
});

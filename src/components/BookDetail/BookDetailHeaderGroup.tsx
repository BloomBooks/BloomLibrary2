// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { Book } from "../../model/Book";
import { observer } from "mobx-react";
import { ReadButton } from "./ReadButton";
import { TranslateButton } from "./TranslateButton";
import { LanguageLink } from "../LanguageLink";
import { getArtifactVisibilitySettings, ArtifactType } from "./ArtifactHelper";
import { ILanguage } from "../../model/Language";
import { ReadOfflineButton } from "./ReadOfflineButton";
import { useMediaQuery, Link } from "@material-ui/core";
import { OSFeaturesContext } from "../../components/OSFeaturesContext";
import { commonUI } from "../../theme";
import { useGetBookCountRaw } from "../../connection/LibraryQueryHooks";
import { getResultsOrMessageElement } from "../../connection/GetQueryResultsUI";
import { getAnchorProps } from "../../embedded";
import { useIsEmbedded } from "../EmbeddingHost";
import { FormattedMessage } from "react-intl";
import { BookThumbnail } from "./BookThumbnail";

export const BookDetailHeaderGroup: React.FunctionComponent<{
    book: Book;
    breakToColumn: string;
    // sometimes in the UI, we know what language the user is interested in,
    //so where possible we're going to preference that if this is a multilingual book
    contextLangIso?: string;
}> = observer((props) => {
    const isEmbedded = useIsEmbedded();
    const { bloomDesktopAvailable, bloomReaderAvailable } = useContext(
        OSFeaturesContext
    );
    const readOnlineSettings = getArtifactVisibilitySettings(
        props.book,
        ArtifactType.readOnline
    );

    const phash = props.book.phashOfFirstContentImage;
    const sanitizedPhashOfFirstContentImage =
        phash && phash.trim() && phash.trim() !== "null"
            ? phash.trim()
            : "Not A Valid Phash";
    const answer = useGetBookCountRaw({
        search: "phash:" + sanitizedPhashOfFirstContentImage,
    });
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
        !isEmbedded && // BL-8698, a this point, people embed BL to publish books, not encourage translation.
        shellBookSettings &&
        shellBookSettings.decision && // it's OK to download and translate the book
        bloomDesktopAvailable; // and this platform can run the software for doing it

    const bloomReaderSettings = getArtifactVisibilitySettings(
        props.book,
        ArtifactType.bloomReader
    );
    const showBloomReaderButton =
        props.book.harvestState === "Done" &&
        bloomReaderSettings && // harvester made a bloomd
        bloomReaderSettings.decision && // no one decided it was not fit to use
        bloomReaderAvailable; // and we're on a platform that supports bloom reader

    const fullWidthButtons = useMediaQuery(
        `(max-width:${props.breakToColumn})`
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
                @media (max-width: ${props.breakToColumn}) {
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
                    @media (max-width: ${props.breakToColumn}) {
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
                            {props.book.getBestTitle(props.contextLangIso)}
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
                        {(props.book.languages.length && (
                            <ul>
                                {props.book.languages.map((l: ILanguage) => (
                                    <li key={l.isoCode}>
                                        <LanguageLink language={l} />
                                    </li>
                                ))}

                                {countOfBooksWithMatchingPhash > 0 && (
                                    <li>
                                        <Link
                                            css={css`
                                                font-size: 9pt;
                                            `}
                                            color={"secondary"}
                                            {...getAnchorProps(
                                                `/phash:${sanitizedPhashOfFirstContentImage}`
                                            )}
                                        >
                                            <FormattedMessage
                                                id="book.detail.translations"
                                                defaultMessage="{count} books that may be translations"
                                                values={{
                                                    count: countOfBooksWithMatchingPhash,
                                                }}
                                            />
                                        </Link>
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
                {showReadOnLine && (
                    <ReadButton
                        book={props.book}
                        fullWidth={fullWidthButtons}
                        contextLangIso={props.contextLangIso}
                    />
                )}
                {showTranslateButton && (
                    <TranslateButton
                        book={props.book}
                        fullWidth={fullWidthButtons}
                        contextLangIso={props.contextLangIso}
                    />
                )}
                {showBloomReaderButton && (
                    <ReadOfflineButton
                        book={props.book}
                        fullWidth={fullWidthButtons}
                        contextLangIso={props.contextLangIso}
                    />
                )}
            </div>
        </div>
    );
});

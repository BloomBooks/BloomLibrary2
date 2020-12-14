// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState, useEffect } from "react";
import { CheapCard } from "./CheapCard";
import LazyLoad from "react-lazyload";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import {
    getLegacyThumbnailUrl,
    getThumbnailUrl,
} from "./BookDetail/ArtifactHelper";
import { FeatureLevelBar } from "./FeatureLevelBar";
import { LanguageFeatureList } from "./LanguageFeatureList";
import { getBestBookTitle } from "../model/Book";

import TruncateMarkup from "react-truncate-markup";
import { useIntl } from "react-intl";

const BookCardWidth = 140;

interface IProps {
    basicBookInfo: IBasicBookInfo;
    className?: string;
    // if we're showing in one row, then we'll let swiper handle the laziness, otherwise
    // we tell the card to try and be lazy itself.
    handleYourOwnLaziness: boolean;
    contextLangIso?: string;
}

export const BookCard: React.FunctionComponent<IProps> = (props) => {
    const l10n = useIntl();
    const legacyStyleThumbnail = getLegacyThumbnailUrl(props.basicBookInfo);
    const [readyToAddAltText, setReadyToAddAltText] = useState(false);
    const { thumbnailUrl, isModernThumbnail } = getThumbnailUrl(
        props.basicBookInfo
    );
    const title = getBestBookTitle(
        props.basicBookInfo.title,
        props.basicBookInfo.allTitles,
        props.contextLangIso
    );
    useEffect(() => {
        // This is just a delay so that Swiper can put a .swiper-lazy-loading class onto
        // the img. What was happening before was that the screen was showing our alt-text
        // for a bit before that happened.
        setTimeout(() => setReadyToAddAltText(true), 500);
    }, []);
    const titlePadding = 3;
    // optional param
    const langParam = props.contextLangIso
        ? "?lang=" + props.contextLangIso
        : "";
    const card = (
        <CheapCard
            className={props.className}
            css={css`
                width: ${BookCardWidth}px;
            `}
            key={props.basicBookInfo.baseUrl}
            target={`book/${props.basicBookInfo.objectId}${langParam}`}
            role="listitem"
            // onClick={() =>
            //     router!.pushBook(
            //         props.basicBookInfo.objectId,
            //         props.contextLangIso
            //     )
            // }
        >
            <img
                className={"swiper-lazy"}
                css={css`
                    height: 100px;
                    /*cover will crop, but fill up nicely*/
                    object-fit: cover;
                    /* new thumbnails are just the image, and they look better if we see the top and lose some of the bottom
                     legacy thumbnails have title at top, so better to center them*/
                    object-position: ${isModernThumbnail ? "top" : ""};
                    /* hides alt text during (most of) lazy loading */
                    &.swiper-lazy-loading {
                        visibility: hidden;
                    }
                `}
                // When the img has no src, browser may show the alt. Very soon, swiper applies the class
                // swiper-lazy-loading which hides it alltogether until swiper sets the src.
                // And then fairly soon after that, hopefully we see the image.
                // But to avoid an ugly flash of this message, we wait half a second before letting it have a value.
                // Don't provide an alt unless the src is missing.  See BL-8963.
                alt={
                    readyToAddAltText && !thumbnailUrl
                        ? l10n.formatMessage({
                              id: "book.detail.thumbnail",
                              defaultMessage: "book thumbnail",
                          })
                        : ""
                }
                // NB: if you're not getting an image, e.g. in Storybook, it might be because it's not inside of a swiper,
                // but wasn't told to 'handle its own laziness'.
                src={props.handleYourOwnLaziness ? thumbnailUrl : undefined}
                data-src={thumbnailUrl}
                onError={(ev) => {
                    // This is unlikely to be necessary now, as we have what we think is a reliable
                    // way to know whether the harvester has created a thumbnail.
                    // And eventually all books should simply have harvester thumbnails.
                    // Keeping the fall-back just in case it occasionally helps.
                    if ((ev.target as any).src !== legacyStyleThumbnail) {
                        (ev.target as any).src = legacyStyleThumbnail;
                    } else {
                        console.error("ugh! no thumbnail in either place");
                    }
                }}
            />

            {/* I think it would look better to have a calm, light grey Bloom logo, or a book outline, or something, instead of this animated
            LOOK AT ME! spinner. */}
            {/* <div
            className={
                "swiper-lazy-preloader " +
                css`
                    margin-top: -50px;
                `
            }
        /> */}
            <FeatureLevelBar basicBookInfo={props.basicBookInfo} />
            <div
                css={css`
                    font-weight: normal;
                    padding-left: ${titlePadding}px;
                    padding-right: ${titlePadding}px;
                    max-height: 40px;
                    overflow-y: hidden;
                    margin-top: 3px;
                    margin-bottom: 0;
                    font-size: 10pt;
                `}
            >
                {/* For most titles, we don't want to pay the cost of checking the length and using this
                truncation component. By experiment, we found that 30 characters causes some false positives
                but not many, and no false negatives so far. */}
                {title.length < 30 ? (
                    title
                ) : (
                    <TruncateMarkup
                        // test false positives css={css`color: red;`}
                        lines={2}
                    >
                        <span>{title}</span>
                    </TruncateMarkup>
                )}
            </div>
            <LanguageFeatureList basicBookInfo={props.basicBookInfo} />
        </CheapCard>
    );
    /* Note, LazyLoad currently breaks strict mode. See app.tsx */
    return props.handleYourOwnLaziness ? <LazyLoad>{card}</LazyLoad> : card;
};

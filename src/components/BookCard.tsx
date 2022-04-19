// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState, useEffect } from "react";
import { CheapCard } from "./CheapCard";
import LazyLoad from "react-lazyload";
import { IBasicBookInfo } from "../connection/LibraryQueryHooks";
import { FeatureLevelBar } from "./FeatureLevelBar";
import { LanguageFeatureList } from "./LanguageFeatureList";
import { Book, getBestBookTitle } from "../model/Book";
import { useIntl } from "react-intl";
import { useResponsiveChoice } from "../responsiveUtilities";
import { ICardSpec, useBaseCardSpec } from "./CardGroup";
import { SmartTruncateMarkup } from "./SmartTruncateMarkup";
import { ReactComponent as DraftIcon } from "../assets/DRAFT-Stamp.svg";
import { SortInfo } from "./SortInfo";

export function useBookCardSpec(): ICardSpec {
    const getResponsiveChoice = useResponsiveChoice();
    return {
        cardWidthPx: getResponsiveChoice(100, 140) as number,
        cardHeightPx: getResponsiveChoice(160, 190) as number,
        cardSpacingPx: useBaseCardSpec().cardSpacingPx,
    };
}

interface IProps {
    basicBookInfo: IBasicBookInfo;
    className?: string;
    // laziness never: if it's in a lazy swiper, there won't be a book card at all unless it's visible,
    // so it should just show everything.
    // laziness swiper: if it's in a non-lazy swiper, we will show every card without a lazy swapper, but let swiper handle
    // the laziness of loading the image. (Not sure this is working with the latest swiper.
    // I don't think we use it any more.)
    // laziness self: otherwise (typically not in any swiper), handle laziness here by putting the content in a LazyLoad.
    laziness: "never" | "self" | "swiper";
    contextLangIso?: string;
}

export const smallCardWidth = 100;
export const largeCardWidth = 140;

export const BookCard: React.FunctionComponent<IProps> = (props) => {
    const l10n = useIntl();
    const cardSpec = useBookCardSpec();
    const legacyStyleThumbnail = Book.getLegacyThumbnailUrl(
        props.basicBookInfo
    );
    const [readyToAddAltText, setReadyToAddAltText] = useState(false);
    const { thumbnailUrl, isModernThumbnail } = Book.getThumbnailUrl(
        props.basicBookInfo
    );
    const getResponsiveChoice = useResponsiveChoice();
    const title =
        getBestBookTitle(
            props.basicBookInfo.title,
            props.basicBookInfo.allTitles,
            props.contextLangIso
        ) || "";
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
    const sortTestingMode = true;
    const card = (
        <CheapCard
            className={props.className}
            css={css`
                height: ${cardSpec.cardHeightPx}px;
                width: ${cardSpec.cardWidthPx}px;
                line-height: normal; // counteract css reset
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
                    height: ${getResponsiveChoice(60, 100)}px;
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
                src={props.laziness === "swiper" ? undefined : thumbnailUrl}
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
                    // need a bit more height on small screen because of thinner
                    // cards
                    max-height: ${getResponsiveChoice(50, 40)}px;
                    overflow-y: hidden;
                    margin-top: 3px;
                    margin-bottom: 0;
                    font-size: 10pt;
                `}
            >
                {/* For most titles, we don't want to pay the cost of checking the length and using this
                truncation component. By experiment, we found that 30 characters causes some false positives
                but not many, and no false negatives so far. */}
                <SmartTruncateMarkup
                    condition={sortTestingMode ? true : title.length >= 30}
                    lines={sortTestingMode ? 1 : 2}
                >
                    <span>{title}</span>
                </SmartTruncateMarkup>
                {sortTestingMode && (
                    <SortInfo title={title} book={props.basicBookInfo} />
                )}
            </div>
            <LanguageFeatureList basicBookInfo={props.basicBookInfo} />
            {props.basicBookInfo.draft && (
                <DraftIcon
                    css={css`
                        position: absolute;
                        width: ${getResponsiveChoice(80, 122)}px;
                        height: ${getResponsiveChoice(65, 94)}px;
                        left: 9px;
                        top: 4px;
                    `}
                />
            )}
        </CheapCard>
    );
    /* Note, LazyLoad currently breaks strict mode. See app.tsx */
    return props.laziness === "self" ? <LazyLoad>{card}</LazyLoad> : card;
};

export const BookCardPlaceholder: React.FunctionComponent = (props) => {
    const cardSpec = useBookCardSpec();
    return (
        // <div
        //     css={css`
        //         // use up the height we will need when we eventually get the info
        //         height: ${cardSpec.cardHeightPx}px;
        //     `}
        // >{`loading...`}</div>

        <CheapCard
            css={css`
                height: ${cardSpec.cardHeightPx}px;
                width: ${cardSpec.cardWidthPx}px;
                line-height: normal; // counteract css reset
            `}
        />
    );
};

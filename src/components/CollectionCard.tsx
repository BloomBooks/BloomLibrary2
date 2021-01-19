// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { CheapCard } from "./CheapCard";
import { BookCount } from "./BookCount";
//import teamIcon from "../assets/team.svg";
import booksIcon from "../assets/books.svg";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";
import { ImgWithCredits } from "../ImgWithCredits";
import { useIntl } from "react-intl";
import { propsToHideAccessibilityElement } from "../Utilities";
import {
    getLocalizedCollectionLabel,
    useGetLocalizedCollectionLabel,
} from "../localization/CollectionLabel";
import { ICollection } from "../model/ContentInterfaces";
import { useResponsiveChoice } from "../responsiveUtilities";
import { ICardSpec } from "./RowOfCards";
import { commonUI } from "../theme";
import TruncateMarkup from "react-truncate-markup";

export enum CollectionCardLayout {
    short,
    shortWithBookCount,
    iconAndBookCount,
}

export function useCollectionCardSpec(layout: CollectionCardLayout): ICardSpec {
    const getResponsiveChoice = useResponsiveChoice();
    // Make the cards smaller vertically if they purposely have no image, not even
    // the default one.
    let height;
    if (layout === CollectionCardLayout.shortWithBookCount)
        height = getResponsiveChoice(70, 90);
    else if (layout === CollectionCardLayout.short) {
        height = getResponsiveChoice(70, 90); /// TODO:once merged up to next, can change to 30px, 50px
    } else if (layout === CollectionCardLayout.iconAndBookCount) {
        height = getResponsiveChoice(90, 130);
    } else {
        console.error("unknown collectionCardLayout: " + layout);
        height = getResponsiveChoice(50, 100);
    }

    return {
        cardWidthPx: getResponsiveChoice(100, 200) as number,
        cardHeightPx: height as number,
        createFromCollection: (collection: ICollection) => (
            <CollectionCard
                collection={collection}
                key={collection.urlKey}
                layout={layout}
            />
        ),
    };
}

// Show a card with the name, icon, count, etc. of the collection. If the user clicks on it, they go to a page showing the collection.
export const CollectionCard: React.FunctionComponent<{
    collection: ICollection;
    layout: CollectionCardLayout;
}> = (props) => {
    const l10n = useIntl();
    const getResponsiveChoice = useResponsiveChoice();
    const cardSpec = useCollectionCardSpec(props.layout);

    const hideTitle = props.collection.hideLabelOnCardAndDefaultBanner;
    const imageUrl = props.collection.iconForCardAndDefaultBanner?.url || "";
    // what we're calling "target" is the last part of url, where the url is <breadcrumb stuff>/<target>
    const target =
        props.collection.type === "page"
            ? `/page/${props.collection!.urlKey}`
            : props.collection!.urlKey;

    // if showing title anyway, don't need it in place of image
    const titleElementIfNoImage = hideTitle ? (
        <React.Fragment />
    ) : (
        <div>
            {props.collection.label
                ? getLocalizedCollectionLabel(props.collection)
                : ""}
        </div>
    );

    // We want the title to be there even if props tell us to hide it, so screen readers can find it.
    const extraPropsIfHidingTitle = hideTitle
        ? propsToHideAccessibilityElement
        : "";

    const positionRule =
        props.layout === CollectionCardLayout.short ||
        props.layout === CollectionCardLayout.shortWithBookCount
            ? "" // just sit under the top padding
            : `bottom: ${getResponsiveChoice(23, 30)}px`;
    //console.log(props.collection.label + "  " + props.collection.type);
    const label = useGetLocalizedCollectionLabel(props.collection);
    const titleElement = (
        <div
            css={css`
                text-align: left;
                font-size: 12pt; // from chrome default for h2, which this element used to be

                font-weight: bold;
                position: absolute;

                ${positionRule};
                ${extraPropsIfHidingTitle}
                // For the sake of uniformity, the only styling we allow in richTextLabel is normal, h1, h2, and h3.
                        // Cards are currently always displayed as second-level objects, therefore we reduce heading
                        // levels to h2, h3, h4.
                        // Here we define what they will look like.
                        h2,
                        h3,
                        h4,
                        p {
                    text-align: left;
                    line-height: 1em;
                    margin-bottom: 0;
                    margin-top: 0;
                    font-weight: bold;
                }
                h2 {
                    font-size: ${getResponsiveChoice(11, 16)}px;
                }
                h3 {
                    font-size: 14px;
                }
                h4 {
                    font-size: 12px;
                }
                p {
                    font-size: 10px;
                }
            `}
        >
            <TruncateMarkup lines={2}>
                {props.collection.richTextLabel ? (
                    // Truncate markup doesn't actually seem to work here. It has very
                    // tight constraints on what it can truncate, and apparently the output
                    // of documentToReactComponents doesn't qualify, though it didn't
                    // complain in console as it does about most problems.
                    // I don't know of any current collections that appear as cards and
                    // have rich text labels; if we create any, we'll need to be careful
                    // they aren't too long.
                    <div>
                        {documentToReactComponents(
                            reduceHeadingLevel(props.collection.richTextLabel)
                        )}
                    </div>
                ) : (
                    // here we have inlined the implementation of CollectionLabel,
                    // since TruncateMarkup can't handle a non-built-in react component
                    <h2>{label}</h2>
                )}
            </TruncateMarkup>
        </div>
    );

    let imgElement = <React.Fragment />;
    if (!imageUrl) {
        imgElement = (
            <img
                src={booksIcon}
                css={css`
                    height: 40px;
                    width: 40px;
                    margin-bottom: 10px;
                `}
                alt={l10n.formatMessage({
                    id: "card.genericBooks",
                    defaultMessage: "A stack of generic books",
                })}
            ></img>
        );
    } else if (imageUrl !== "none") {
        // About this dimension. 80px height is plenty for the logos of large
        // publishers with professionally-designed logos, which work well when
        // small. However many orgs have small text in their logos which is
        // unreadable at this size. Sigh. In Contentful we have the option of
        // just setting it to show the title explicitly in these cases.

        // Enhance... this is a bit complicated at the moment... here's the deal
        // On our shrunk down cards for mobile, the publisher icons contain the
        // name, so the title is hidden and the icon is unreadable.  So in that
        // case we don't need to leave room for the title and can use it to make
        // the icon bigger. However on desktop, that doesn't look as good, and
        // isn't needed.
        const maxHeight = (hideTitle
            ? getResponsiveChoice(60, 80)
            : getResponsiveChoice(35, 60)) as number;

        // Usual case, show the image defined in the collection
        imgElement = (
            <ImgWithCredits
                credits={props.collection.iconCredits}
                src={imageUrl}
                css={css`
                    min-height: ${maxHeight}px; // this is for our Book feature svg icons that otherwise want to be tiny. Alternatively, we could just set these svgs to want to be big.
                    max-height: ${maxHeight}px;
                    object-fit: contain;
                    max-width: 100%;

                    margin-right: auto;
                    margin-top: auto;
                    margin-bottom: ${hideTitle ? "auto" : "10px"};
                `}
                // While we're waiting, show the text title
                loader={titleElementIfNoImage}
                // If we could not get an image, show the text title
                unloader={titleElementIfNoImage}
                // If we have an explicit altText, use it.
                // An explicit empty alt text indicates it is only decorative, at
                // least from the viewpoint of a screen reader (BL-8963).
                alt={props.collection.iconAltText ?? ""}
            />
        );
    }

    const { ...propsToPassDown } = props; // prevent react warnings

    return (
        <CheapCard
            {...propsToPassDown} // needed for swiper to work
            css={css`
                width: ${cardSpec.cardWidthPx}px;
                position: relative; // so auto width of absolutely positioned child is relative to this
                padding: ${commonUI.paddingForCollectionAndLanguageCardsPx}px;
                height: ${cardSpec.cardHeightPx}px;
                justify-content: ${props.layout ===
                    CollectionCardLayout.short ||
                props.layout === CollectionCardLayout.shortWithBookCount
                    ? "center"
                    : ""};
            `}
            target={target}
            role="listitem"
        >
            {![
                CollectionCardLayout.short,
                CollectionCardLayout.shortWithBookCount,
            ].includes(props.layout) && imgElement}
            {/* TODO: we would like to truncate, but TruncateMarkup says it cannot handle react elements */}
            {titleElement}
            <div
                className="book-count"
                css={css`
                    margin-top: auto;
                    text-align: left;
                    font-size: ${getResponsiveChoice(10, 14)}px;
                `}
            >
                {props.collection.filter && (
                    <BookCount filter={props.collection.filter} />
                )}
            </div>
        </CheapCard>
    );
};

// Reduce heading levels throughout the input document.
// Currently assumes document is from contentful, where we permit only h1, h2, h3
// This is for accessibility: semantically, cards in a collection are second-level,
// so (for example) keyboard navigation through level 1 headings should skip them.
function reduceHeadingLevel(input: Document): Document {
    const result = reduceHeadingLevelInternal({ ...input }) as Document;
    return result;
}

function reduceHeadingLevelInternal(input: object): object {
    if (input.hasOwnProperty("content") && input.hasOwnProperty("nodeType")) {
        const result: any = { ...input };
        result.content = result.content.map((x: object) =>
            reduceHeadingLevelInternal(x)
        );
        result.nodeType = reduceHeadingLevelInString(result.nodeType);
        return result;
    }
    return input;
}

function reduceHeadingLevelInString(input: string): string {
    switch (input) {
        case "heading-1":
            return "heading-2";
        case "heading-2":
            return "heading-3";
        case "heading-3":
            return "heading-4";
        default:
            return input;
    }
}

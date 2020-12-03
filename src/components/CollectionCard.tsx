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
import { CollectionLabel } from "../localization/CollectionLabel";
import { ICollection } from "../model/ContentInterfaces";

interface IProps {
    collection: ICollection;
    kind?: "short" | undefined;
}

// Show a card with the name, icon, count, etc. of the collection. If the user clicks on it, they go to a page showing the collection.
export const CollectionCard: React.FunctionComponent<IProps> = (props) => {
    const l10n = useIntl();
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
        <div>{props.collection.label || ""}</div>
    );

    // We want the title to be there even if props tell us to hide it, so screen readers can find it.
    const extraPropsIfHidingTitle = hideTitle
        ? propsToHideAccessibilityElement
        : "";
    const titleElement = (
        <div
            css={css`
                text-align: center;
                font-size: 12pt; // from chrome default for h2, which this element used to be
                font-weight: bold;
                flex-grow: 1; // push the rest to the bottom
                margin-bottom: 5px;
                ${extraPropsIfHidingTitle}
                // For the sake of uniformity, the only styling we allow in richTextLabel is normal, h1, h2, and h3.
                        // Cards are currently always displayed as second-level objects, therefore we reduce heading
                        // levels to h2, h3, h4.
                        // Here we define what they will look like.
                        h2,
                        h3,
                        h4,
                        p {
                    text-align: center;
                    margin-bottom: 0;
                    margin-top: 0;
                    font-weight: bold;
                }
                h2 {
                    font-size: 16px;
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
            {props.collection.richTextLabel ? (
                documentToReactComponents(
                    reduceHeadingLevel(props.collection.richTextLabel)
                )
            ) : (
                <h2>
                    <CollectionLabel collection={props.collection} />
                </h2>
            )}
        </div>
    );

    let imgElement = <React.Fragment />;
    if (!imageUrl) {
        imgElement = (
            <img
                src={booksIcon}
                css={css`
                    height: 40px;
                    margin-bottom: 10px;
                `}
                alt={l10n.formatMessage({
                    id: "card.genericBooks",
                    defaultMessage: "A stack of generic books",
                })}
            ></img>
        );
    } else if (imageUrl !== "none") {
        const maxHeight = hideTitle ? 129 : 100;
        // Usual case, show the image defined in the collection
        imgElement = (
            <ImgWithCredits
                credits={props.collection.iconCredits}
                src={imageUrl}
                css={css`
                    height: ${maxHeight}px;
                    object-fit: contain;
                    width: 198px;
                    margin-left: auto;
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
    // make the cards smaller vertically if they purposely have no image, not even
    // the default one. Otherwise, let the default CheapCard height prevail.
    const height = imageUrl === "none" ? "height: 100px" : "";
    return (
        <CheapCard
            {...propsToPassDown} // needed for swiper to work
            css={css`
                width: 220px;
                padding: 10px;
                ${height}
            `}
            target={target}
            role="listitem"
        >
            {titleElement}
            {props.kind !== "short" && imgElement}

            <div
                css={css`
                    margin-top: auto;
                    text-align: center;
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

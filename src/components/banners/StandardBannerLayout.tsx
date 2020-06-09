import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { ImageCreditsTooltip } from "./ImageCreditsTooltip";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { commonUI } from "../../theme";
import { Breadcrumbs } from "../Breadcrumbs";
import { BookCount } from "../BookCount";
import { IFilter } from "../../IFilter";
import { ICollection, splitMedia } from "../../model/Collections";
import { ImgWithCredits } from "../../ImgWithCredits";
import { ButtonRow } from "../ButtonRow";
export const StandardBannerLayout: React.FunctionComponent<{
    id: string; // of the banner object on contentful
    collection?: ICollection;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
    bannerFields: any;
}> = (props) => {
    const backgroundImage =
        props.bannerFields?.backgroundImage?.fields?.file?.url ?? "";
    let logoUrl = props.bannerFields?.logo?.fields?.file?.url ?? undefined;
    let { credits: logoCredits, altText: logoAltText } = splitMedia(
        props.bannerFields?.logo
    );
    const textColor = backgroundImage ? "white" : "black";

    const darkenBackgroundImageFraction = backgroundImage ? 0.4 : 0;
    const linkColor = backgroundImage ? "white" : commonUI.colors.bloomRed;

    let bannerTitle: React.ReactNode = (
        <React.Fragment>{props.bannerFields.title}</React.Fragment>
    );
    let hideTitle = props.bannerFields.hideTitle;
    const defaultBannerIds = [
        "Qm03fkNd1PWGX3KGxaZ2v", // default banner for others that lack one and other generated collections like search.
        "7v95c68TL9uJBe4pP5KTN0", // default language banner
        "7E1IHa5mYvLLSToJYh5vfW", // default topic banner
    ];
    if (defaultBannerIds.includes(props.id)) {
        if (props.collection?.label) {
            bannerTitle = (
                <React.Fragment>{props.collection.label}</React.Fragment>
            );
        }
        if (props.collection?.richTextLabel) {
            bannerTitle = documentToReactComponents(
                props.collection.richTextLabel
            );
        }
        if (props.collection?.iconForCardAndDefaultBanner) {
            logoUrl = props.collection.iconForCardAndDefaultBanner;
            logoAltText = props.collection.iconAltText ?? "";
            logoCredits = props.collection.iconCredits ?? "";
        }
        hideTitle = props.collection?.hideLabelOnCardAndDefaultBanner;
    }

    //const titleLines = banner.title;
    // const secondTitleLine =
    //     titleLines.length > 1 ? <div> {titleLines[1]}</div> : "";
    const showLogo = logoUrl && logoUrl !== "none";
    console.log("css: " + props.bannerFields.css);
    let bookCount: React.ReactFragment | undefined;
    if (props.bookCount !== undefined) {
        // if it's an empty string, we assume it's pending real data
        bookCount = <h2>{props.bookCount}</h2>;
    } else if (props.filter) {
        bookCount = (
            <h2>
                <BookCount filter={props.filter} />
            </h2>
        );
    }
    return (
        <div
            css={css`
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background-size: cover;
                * {
                    color: ${textColor};
                }

                background-image: url(${backgroundImage});
                background-position: ${props.bannerFields.backgroundImagePosition};
                /* this can override any of the above*/
                /* ${props.bannerFields.css} */
            `}
        >
            <div
                id="contrast-overlay"
                css={css`
                    background-color: rgba(
                        0,
                        0,
                        0,
                        ${darkenBackgroundImageFraction}
                    );
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                    overflow: hidden;
                `}
            >
                {["root.read", "create"].includes(
                    props.collection?.urlKey!
                ) || <Breadcrumbs />}
                <div
                    css={css`
                        display: flex;
                        flex-direction: ${logoUrl ? "row" : "column"};
                        overflow: hidden;
                    `}
                >
                    {showLogo && (
                        <div
                            css={css`
                                display: flex;
                                flex-direction: column;
                                max-height: 260px;
                            `}
                        >
                            <ImgWithCredits
                                credits={logoCredits}
                                src={logoUrl}
                                alt={
                                    logoAltText
                                        ? logoAltText
                                        : "logo for " + props.bannerFields.title
                                }
                                css={css`
                                    height: 150px;
                                    margin-right: 50px;
                                `}
                            />
                            <div
                                id="push-bookcount-down"
                                css={css`
                                    height: 0;
                                    flex-grow: 1;
                                `}
                            />
                            {bookCount}
                        </div>
                    )}
                    <div
                        css={css`
                            flex-grow: 2;
                            display: flex;
                            flex-direction: column;
                            color: white;
                        `}
                    >
                        {hideTitle || (
                            <h1
                                css={css`
                                    font-size: 36px;
                                    margin-top: 0;
                                    /*flex-grow: 1; // push the rest to the bottom*/
                                    // For the sake of uniformity, the only styling we allow in richTextLabel is normal, h1, h2, and h3.
                                    // Here we define what they will look like. H1 continues to get the default
                                    // 36px we use for plain labels. (Review: or, make H2 that, and let H1 be a way to get bigger?)
                                    h1 {
                                        font-size: 36px; // rich text will produce an h1 nested inside the h1 above.
                                    }
                                    h2 {
                                        font-size: 32px;
                                        font-weight: 500; // our master style sheet makes H1 this, don't want h2 bolder
                                    }
                                    h3 {
                                        font-size: 28px;
                                        font-weight: 500;
                                    }
                                    p {
                                        font-size: 24px;
                                    }
                                `}
                            >
                                {bannerTitle}
                                {/* {titleLines[0]}
                        //{secondTitleLine} */}
                            </h1>
                        )}

                        <div
                            css={css`
                                font-weight: normal;
                                max-width: 600px;
                                margin-bottom: 10px;
                                overflow: auto;
                            `}
                        >
                            {documentToReactComponents(
                                props.bannerFields.blurb
                            )}
                        </div>
                        <div
                            css={css`
                                margin-top: auto;
                                margin-bottom: 5px;
                                display: flex;
                                justify-content: space-between;
                                width: 100%;
                            `}
                        >
                            {!showLogo &&
                                props.collection?.urlKey !== "new-arrivals" && (
                                    <div
                                        css={css`
                                            font-size: 14pt;
                                            margin-top: auto;
                                        `}
                                    >
                                        {bookCount}
                                    </div>
                                )}
                            {/* just a placeholder to push the imagecredits to the right
                             */}
                            <div></div>
                            {props.bannerFields.buttonRow && (
                                <ButtonRow
                                    collection={
                                        props.bannerFields.buttonRow.fields
                                    }
                                />
                            )}
                            {/* there should always be imageCredits, but they may not
                        have arrived yet */}
                            {props.bannerFields.imageCredits && (
                                <ImageCreditsTooltip
                                    imageCredits={documentToReactComponents(
                                        props.bannerFields.imageCredits
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

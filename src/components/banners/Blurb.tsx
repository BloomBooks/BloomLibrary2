import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { ImageCreditsTooltip } from "./ImageCreditsTooltip";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BookCount } from "../BookCount";
import { IFilter } from "../../IFilter";
import { ICollection, splitMedia } from "../../model/Collections";
import { ButtonRow } from "../ButtonRow";

export const Blurb: React.FunctionComponent<{
    id: string; // of the banner object on contentful
    collection?: ICollection;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
    bannerFields: any;
    width?: string;
    padding?: string;
}> = (props) => {
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
    // logo is not supported in this layout    let logoUrl = props.bannerFields?.logo?.fields?.file?.url ?? undefined;
    // let { credits: logoCredits, altText: logoAltText } = splitMedia(
    //     props.bannerFields?.logo
    // );
    const bannerTitle: React.ReactNode = (
        <React.Fragment>{props.bannerFields.title}</React.Fragment>
    );
    return (
        <div
            css={css`
                //flex-grow: 2;
                display: flex;
                flex-direction: column;
                color: white;
                width: ${props.width};
                padding: ${props.padding};
            `}
        >
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
            </h1>

            <div
                css={css`
                    font-weight: normal;
                    max-width: 600px;
                    margin-bottom: 10px;
                    overflow: auto;
                `}
            >
                {documentToReactComponents(props.bannerFields.blurb)}
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
                {props.collection?.urlKey !== "new-arrivals" && (
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
                        collection={props.bannerFields.buttonRow.fields}
                    />
                )}
            </div>
        </div>
    );
};
export const ImageOnRightBannerLayout: React.FunctionComponent<{
    id: string; // of the banner object on contentful
    collection?: ICollection;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
    bannerFields: any;
}> = (props) => {
    //const linkColor = sideImage ? "white" : commonUI.colors.bloomRed;

    console.log("css: " + props.bannerFields.css);

    return (
        <React.Fragment>
            <Blurb {...props} />
            <div
                css={css`
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                `}
            >
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
        </React.Fragment>
    );
};

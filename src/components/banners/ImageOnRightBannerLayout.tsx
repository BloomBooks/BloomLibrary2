import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { ImageCreditsTooltip } from "./ImageCreditsTooltip";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { IFilter } from "../../IFilter";
import { ICollection, splitMedia } from "../../model/Collections";
import { Blurb } from "./Blurb";
import useMedia from "use-media";

export const ImageOnRightBannerLayout: React.FunctionComponent<{
    id: string; // of the banner object on contentful
    collection?: ICollection;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
    bannerFields: any;
}> = (props) => {
    // don't try to show the image on phones
    const showImage = useMedia({ minWidth: "412px" }); // 1px + largest phone width in the chrome debugger

    const backgroundImage =
        props.bannerFields?.backgroundImage?.fields?.file?.url ?? "";
    return (
        <div
            css={css`
                display: flex;
                flex-direction: row;
            `}
        >
            <Blurb
                {...props}
                padding={"30px"}
                width={showImage ? "500px" : "100%"}
            />

            {showImage && (
                <div
                    css={css`
                        display: flex;
                        flex-direction: column;
                        flex-grow: 1;
                        overflow: hidden;
                        background-size: cover;
                        * {
                            color: white;
                        }

                        background-image: url(${backgroundImage});
                        background-position: ${props.bannerFields
                            .backgroundImagePosition};
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
            )}
        </div>
    );
};

import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { ImageCreditsTooltip } from "./ImageCreditsTooltip";
import { IFilter } from "../../IFilter";
import { IBanner, ICollection } from "../../model/ContentInterfaces";
import { Blurb } from "./Blurb";
import useMedia from "use-media";
import { Breadcrumbs } from "../Breadcrumbs";

export const ImageOnRightBannerLayout: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
}> = (props) => {
    // don't try to show the image on phones
    const showImage = useMedia({ minWidth: "412px" }); // 1px + largest phone width in the chrome debugger

    const backgroundImageUrl = props.banner.backgroundImage?.url || "";
    return (
        <div
            css={css`
                margin-left: 30px;
            `}
        >
            <Breadcrumbs />

            <div
                css={css`
                    display: flex;
                    flex-direction: row;
                `}
            >
                <Blurb
                    {...props}
                    //padding={"30px"}
                    width={showImage ? "500px" : "100%"}
                    hideTitle={props.banner.hideTitle}
                />

                {showImage && (
                    <div
                        css={css`
                            display: flex;
                            flex-direction: column;
                            flex-grow: 1;
                            overflow: hidden;
                            background-size: cover;
                            margin-left: 20px;
                            * {
                                color: white;
                            }

                            background-image: url(${backgroundImageUrl});
                            background-position: ${props.banner
                                .backgroundImagePosition};
                        `}
                    >
                        {/* there should always be imageCredits, but they may not
                        have arrived yet */}
                        {props.banner.backgroundImage?.credits && (
                            <ImageCreditsTooltip
                                imageCredits={
                                    // we could make this markdown eventually but for now it's just a string
                                    <span>
                                        props.banner.backgroundImage?.credits
                                    </span>
                                }
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

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
import { BookCount } from "../BookCount";

export const ImageOnRightBannerLayout: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
}> = (props) => {
    // don't try to show the image on phones
    const showImage = useMedia({ minWidth: "415px" }); // 1px + largest phone width in the chrome debugger

    const backgroundImageUrl = props.banner.backgroundImage?.url || "";
    return (
        <div
            css={css`
                display: flex;
                flex-direction: row;
            `}
        >
            <div
                css={css`
                    padding: 30px;
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
                </div>
                {props.bookCount || <BookCount filter={props.filter || {}} />}
            </div>
            {showImage && (
                // the classname here is used by stylesheets in contentful
                <div
                    className="banner-image"
                    css={css`
                        display: flex;
                        flex-direction: column;
                        flex-grow: 1;
                        overflow: hidden;
                        // note: until Jan 2021 this was cover. Gives nice
                        // effects when it works, but is harder to pull off.
                        // Suzanne & I decided to dial this back to "contain",
                        // and then let css defined in contentful switch back to
                        // "cover" for those images where it works well.
                        background-size: contain;
                        background-repeat: no-repeat;
                        margin-left: auto; // if contentful then sets the image to have a fixed width, we get right-alignment
                        margin: 20px; // inset the image into the banner so there is color all around
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
                                    {props.banner.backgroundImage?.credits}
                                </span>
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
};

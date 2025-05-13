import { css } from "@emotion/react";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156

import { BannerImageCredits } from "./ImageCreditsTooltip";
import { IBanner, ICollection } from "../../model/ContentInterfaces";
import { Blurb } from "./Blurb";
import useMedia from "use-media";
import { Breadcrumbs } from "../Breadcrumbs";
import { BookCount } from "../BookCount";

export const ImageOnRightBannerLayout: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
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
                    <Blurb {...props} hideTitle={props.banner.hideTitle} />
                </div>
                {props.bookCount || (
                    <BookCount collection={props.collection || {}} />
                )}
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
                        // Aim for 20% of the screen width, then when there is not enough space, start shrinking until
                        // a minium
                        min-width: clamp(200px, 0.2vw, 300px);

                        // note: until Jan 2021 this was cover. Gives nice
                        // effects when it works, but is harder to pull off.
                        // Suzanne & I decided to dial this back to "contain",
                        // and then let css defined in contentful switch back to
                        // "cover" for those images where it works well.
                        background-size: contain;
                        background-repeat: no-repeat;
                        // this causes the image to be right aligned.
                        // margin-left:auto does not work
                        background-position-x: 100%;
                        //margin-left: auto; // if contentful then sets the image to have a fixed width, we get right-alignment
                        margin: 20px; // inset the image into the banner so there is color all around
                        * {
                            color: white;
                        }

                        background-image: url(${backgroundImageUrl});
                        background-position: ${props.banner
                            .backgroundImagePosition || "bottom right"};
                    `}
                >
                    <BannerImageCredits {...props} />
                </div>
            )}
        </div>
    );
};

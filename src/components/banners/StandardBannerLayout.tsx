import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Breadcrumbs } from "../Breadcrumbs";
import { BookCount } from "../BookCount";
import { IFilter } from "../../IFilter";
import { ICollection, IBanner } from "../../model/ContentInterfaces";
import { ImgWithCredits } from "../../ImgWithCredits";
import { Blurb } from "./Blurb";
import { useMediaQuery } from "@material-ui/core";

export const StandardBannerLayout: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
}> = (props) => {
    const backgroundImage = props.banner.backgroundImage?.url ?? "";

    const textColor = backgroundImage ? "white" : "black";

    const darkenBackgroundImageFraction = backgroundImage ? 0.4 : 0;

    const showImageAndBlurbSideBySide = useMediaQuery(`(min-width:320px)`);
    const direction = showImageAndBlurbSideBySide ? "row" : "column";

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
                background-position: ${props.banner.backgroundImagePosition};
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
                        flex-direction: ${direction};
                        max-height: 260px;
                        overflow: hidden;
                    `}
                >
                    <LogoOnBanner
                        collection={props.collection}
                        banner={props.banner}
                        // for wide images, height: auto makes them no higher
                        // then they need to be for the available width.
                        // For tall ones, half the usual height keeps them small
                        // enough so some of the text fits.
                        cssExtra={
                            showImageAndBlurbSideBySide
                                ? ""
                                : "height: auto; max-height: 75px;"
                        }
                    />

                    <Blurb
                        {...props}
                        width={"auto"}
                        hideTitle={
                            props.collection.hideLabelOnCardAndDefaultBanner ||
                            props.banner.hideTitle
                        }
                    />
                </div>

                {props.collection?.urlKey !== "new-arrivals" &&
                    (props.bookCount || (
                        <BookCount filter={props.filter || {}} />
                    ))}
            </div>
        </div>
    );
};

// we can either show the logo explicitly defined on the banner, or fall back to one defined on the collection, or neither.
export const LogoOnBanner: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    cssExtra?: string;
}> = (props) => {
    const logo = props.banner.logo
        ? props.banner.logo
        : props.collection.iconForCardAndDefaultBanner;
    return (
        (logo && (
            <ImgWithCredits
                credits={logo.credits}
                src={logo.url}
                // If the logo doesn't supply an altText, don't add one.  See BL-8963.
                alt={logo.altText ? logo.altText : ""}
                // complicated stuff is going on here with the display:flex on the
                // parent div, particularly in row mode. FlexBox has an unobvious idea
                // of the natural and minimum size of various things. By default an img
                // with specified height can neight grow nor shrink, so as things get narrow,
                // it shrinks the text as much as it can. Usually what it thinks is the minimum size
                // is slightly more than the width of the Global Digital Library link (unwrapped).
                // The space available with an unshrunk image can easily end up narrower
                // than that, and then the text gets clipped
                // (we're in overflow:hidden) both horizontally and vertically.
                // Using object-fit:contain unobviously allows flex-box to shrink the image
                // (without distorting it);
                // object-position keeps it at the top left. Flex-box rather likes to shrink the
                // margin-right; max-width:95% keeps SOME gap, though I haven't figured out exactly why.
                css={css`
                    height: 150px;
                    margin-right: 50px;
                    max-width: 95%;
                    object-fit: contain;
                    object-position: 0 0;
                    ${props.cssExtra}
                `}
            />
        )) || <React.Fragment></React.Fragment>
    );
};

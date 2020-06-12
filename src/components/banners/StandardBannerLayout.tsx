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

export const StandardBannerLayout: React.FunctionComponent<{
    collection: ICollection;
    banner: IBanner;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
}> = (props) => {
    const backgroundImage = props.banner.backgroundImage?.url ?? "";

    const textColor = backgroundImage ? "white" : "black";

    const darkenBackgroundImageFraction = backgroundImage ? 0.4 : 0;

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
                        flex-direction: row;
                        max-height: 260px;
                        overflow: hidden;
                    `}
                >
                    <LogoOnBanner
                        collection={props.collection}
                        banner={props.banner}
                    />

                    <Blurb
                        {...props}
                        width={"100%"}
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
}> = (props) => {
    const logo = props.banner.logo
        ? props.banner.logo
        : props.collection.iconForCardAndDefaultBanner;
    return (
        (logo && (
            <ImgWithCredits
                credits={logo.credits}
                src={logo.url}
                alt={
                    logo.altText
                        ? logo.altText
                        : "logo for " + props.banner.title
                }
                css={css`
                    height: 150px;
                    margin-right: 50px;
                `}
            />
        )) || <React.Fragment></React.Fragment>
    );
};

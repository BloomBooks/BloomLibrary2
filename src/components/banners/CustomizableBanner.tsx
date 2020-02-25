// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { BannerContents, IBannerSpec } from "./Banners";
import { IFilter } from "../../IFilter";

export const CustomizableBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
    spec: IBannerSpec;
}> = props => {
    return (
        <BannerContents
            title={props.spec.titleOverride || `${props.title}`}
            about={props.spec.about}
            bookCountMessage="{0} books"
            filter={props.filter}
            imageCredits={props.spec.imageCredits}
            bannerCss={props.spec.bannerCss}
        />
    );
};

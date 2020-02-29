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

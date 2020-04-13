import React from "react";
import { BannerContents, IBannerSpec } from "./Banners";
import { IFilter } from "../../IFilter";

export const CustomizableBanner: React.FunctionComponent<{
    title: string;
    filter: IFilter;
    spec: IBannerSpec;
    bookCountMessage?: string;
}> = (props) => {
    return (
        <BannerContents
            title={props.spec.titleOverride || `${props.title}`}
            about={props.spec.about}
            bookCountMessage={
                props.bookCountMessage === undefined
                    ? "{0} books"
                    : props.bookCountMessage
            }
            filter={props.filter}
            imageCredits={props.spec.imageCredits}
            bannerCss={props.spec.bannerCss}
        />
    );
};

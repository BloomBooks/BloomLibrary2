// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { IFilter } from "../IFilter";
import { CustomizableBanner } from "./banners/CustomizableBanner";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { BookGroup } from "./BookGroup";
import { IBannerSpec } from "./banners/Banners";
import { featureSpecs } from "./FeatureHelper";
import { useTheme } from "@material-ui/core";

function getFeatureBannerSpec(key: string, theme: any): IBannerSpec {
    const featureSpec = featureSpecs.find(s => s.featureKey === key);
    if (!featureSpec) return { key };

    return {
        key: featureSpec.featureKey,
        about: featureSpec.description,
        bannerCss: css`
            background-color: ${theme.palette.secondary.main};
        `
    };
}
export const FeaturePage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => {
    const featureKey: string = props.filter.feature || "default";

    return (
        <React.Fragment>
            <CustomizableBanner
                title={props.title}
                filter={props.filter}
                spec={getFeatureBannerSpec(featureKey, useTheme())}
            />

            <ListOfBookGroups>
                <BookGroup title={`All`} filter={props.filter} rows={20} />
            </ListOfBookGroups>
        </React.Fragment>
    );
};

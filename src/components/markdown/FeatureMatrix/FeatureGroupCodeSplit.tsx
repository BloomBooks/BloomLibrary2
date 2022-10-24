import React from "react";

export interface IFeatureGroupProps {
    name: string;
}

// This is wrapped so that we can keep all the javascript involved in the FeatureGroup
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const FeatureGroupCodeSplit: React.FunctionComponent<IFeatureGroupProps> = (
    props
) => {
    const FeatureGroup = React.lazy(
        () => import(/* webpackChunkName: "featureGroup" */ "./FeatureGroup")
    );
    return (
        <React.Suspense fallback={<div />}>
            <FeatureGroup {...props} />
        </React.Suspense>
    );
};

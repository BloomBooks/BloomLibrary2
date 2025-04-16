import React from "react";

export interface IFeatureMatrixProps {
    // These are passed in as props so they can be localized in Contentful.
    freeLabel?: string;
    proLabel?: string;
    communityLabel?: string;
    enterpriseLabel?: string;
}

// This is wrapped so that we can keep all the javascript involved in the FeatureMatrix
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const FeatureMatrixCodeSplit: React.FunctionComponent<IFeatureMatrixProps> = (
    props
) => {
    const FeatureMatrix = React.lazy(
        () => import(/* webpackChunkName: "featureMatrix" */ "./FeatureMatrix")
    );
    return (
        <React.Suspense fallback={<div />}>
            <FeatureMatrix {...props} />
        </React.Suspense>
    );
};

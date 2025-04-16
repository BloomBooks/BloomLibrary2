import React from "react";

export interface IFeatureProps {
    name: string;
    freeText?: string;
    proText?: string;
    communityTag?: string;
    enterpriseText?: string;
    pro: boolean;
    community: boolean;
    enterprise: boolean;
}

// This is wrapped so that we can keep all the javascript involved in the Feature
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const FeatureCodeSplit: React.FunctionComponent<IFeatureProps> = (
    props
) => {
    const Feature = React.lazy(
        () => import(/* webpackChunkName: "feature" */ "./Feature")
    );
    return (
        <React.Suspense fallback={<div />}>
            <Feature {...props} />
        </React.Suspense>
    );
};

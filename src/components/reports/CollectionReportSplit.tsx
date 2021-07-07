import React from "react";

export interface ICollectionReportProps {
    collectionName: string;
}

// This is wrapped so that we can keep all the javascript involved in the CollectionReport
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const CollectionReportSplit: React.FunctionComponent<ICollectionReportProps> = (
    props
) => {
    const CollectionReport = React.lazy(
        () =>
            import(
                /* webpackChunkName: "CollectionReport" */ "./CollectionReport"
            )
    );
    return (
        <React.Suspense fallback={<div>Loading report...</div>}>
            <CollectionReport {...props} />
        </React.Suspense>
    );
};

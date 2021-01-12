import React from "react";

export interface ICollectionStatsPageProps {
    collectionName: string;
}

// This is wrapped so that we can keep all the javascript involved in the BookDetail
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const CollectionStatsPageCodeSplit: React.FunctionComponent<ICollectionStatsPageProps> = (
    props
) => {
    const CollectionStatsPage = React.lazy(
        () =>
            import(
                /* webpackChunkName: "collectionStatsPage" */ "./CollectionStatsPage"
            )
    );
    return (
        <React.Suspense fallback={<div>Loading stats...</div>}>
            <CollectionStatsPage {...props} />
        </React.Suspense>
    );
};

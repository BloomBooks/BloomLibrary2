import React from "react";

export interface IBulkEditPageProps {
    filters: string;
}

// This is wrapped so that we can keep all the javascript involved in the BulkEditPage
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const BulkEditPageCodeSplit: React.FunctionComponent<IBulkEditPageProps> = (
    props
) => {
    const BulkEditPage = React.lazy(
        () => import(/* webpackChunkName: "bulkEditPage" */ "./BulkEditPage")
    );
    return (
        <React.Suspense fallback={<div>Loading Bulk Edit...</div>}>
            <BulkEditPage {...props} />
        </React.Suspense>
    );
};

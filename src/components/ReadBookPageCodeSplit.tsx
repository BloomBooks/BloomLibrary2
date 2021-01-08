import React from "react";

export interface IReadBookPageProps {
    id: string;
}

// This is wrapped so that we can keep all the javascript involved in the BookDetail
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const ReadBookPageCodeSplit: React.FunctionComponent<IReadBookPageProps> = (
    props
) => {
    const ReadBookPage = React.lazy(
        () => import(/* webpackChunkName: "readBookPage" */ "./ReadBookPage")
    );
    return (
        <React.Suspense fallback={<div>Loading Book...</div>}>
            <ReadBookPage {...props} />
        </React.Suspense>
    );
};

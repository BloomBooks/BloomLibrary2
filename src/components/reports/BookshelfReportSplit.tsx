import React from "react";

export interface IBookshelfReportProps {
    bookshelfName: string;
}

// This is wrapped so that we can keep all the javascript involved in the CollectionStatsPage
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const BookshelfReportSplit: React.FunctionComponent<IBookshelfReportProps> = (
    props
) => {
    const BookshelfReport = React.lazy(
        () =>
            import(
                /* webpackChunkName: "BookshelfReport" */ "./BookshelfReport"
            )
    );
    return (
        <React.Suspense fallback={<div>Loading report...</div>}>
            <BookshelfReport {...props} />
        </React.Suspense>
    );
};

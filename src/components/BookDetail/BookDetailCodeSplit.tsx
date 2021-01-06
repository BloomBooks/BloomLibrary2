import React from "react";

export interface IBookDetailProps {
    id: string;
}

// This is wrapped so that we can keep all the javascript involved in the BookDetail
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const BookDetailCodeSplit: React.FunctionComponent<IBookDetailProps> = (
    props
) => {
    const BookDetail = React.lazy(
        () => import(/* webpackChunkName: "bookDetail" */ "./BookDetail")
    );
    return (
        <React.Suspense fallback={<div>Loading book information...</div>}>
            <BookDetail {...props} />
        </React.Suspense>
    );
};

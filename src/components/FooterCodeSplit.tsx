import React from "react";

// This is wrapped so that we can keep all the javascript involved in the Footer
// in a separate js file, downloaded to the user's browser only if he/she needs it.
export const FooterCodeSplit: React.FunctionComponent = (props) => {
    const Footer = React.lazy(
        () => import(/* webpackChunkName: "footer" */ "./Footer")
    );
    return (
        <React.Suspense fallback={<div />}>
            <Footer {...props} />
        </React.Suspense>
    );
};

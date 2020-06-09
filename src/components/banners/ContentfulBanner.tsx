import css from "@emotion/css/macro";
import React, { useState } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { useContentful } from "react-contentful";
import { IFilter } from "../../IFilter";
import { ICollection } from "../../model/Collections";
import { StandardBannerLayout } from "./StandardBannerLayout";
import { ImageOnRightBannerLayout } from "./ImageOnRightBannerLayout";
export const ContentfulBanner: React.FunctionComponent<{
    id: string; // of the banner object on contentful
    collection?: ICollection;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
}> = (props) => {
    const [gotData, setGotData] = useState(false);
    const { data, error, fetched, loading } = useContentful({
        contentType: "pageBanner",
        id: `${props.id}`,
        // default for "include' is "1", and with the current model, we only need to go 1 deep (to get the background image url)
        // include: 1
    });
    if (loading || !fetched) {
        return null;
    }

    if (error) {
        console.error(error);
        return (
            <p>
                Error ${error} looking for banner id = ${props.id}.
            </p>
        );
    }

    if (!data) {
        return <p>Could not retrieve the banner id ${props.id}.</p>;
    }

    const bannerFields = (data as any).fields;
    // I don't know why this happens, but sometimes data comes back as a promise instead of
    // the actual data. Reproduction steps as of May 18 2020: Navigate from home page through
    // Enabling Writers to American University of Nigeria, then to the More page for level 1,
    // then click the Breadcrumb for American University of Nigeria. As the resulting page
    // is drawn, we get data here being a promise.
    // The gotData flag and calling setGotData here are  just a trick to re-render when the data
    // is really available.
    // This appears to be a bug in the useContentful code, and of course it could return a
    // promise more than once; but so far this has proved a sufficient work-around.
    if (!bannerFields && (data as any).then) {
        (data as any).then(() => setGotData(true));
        return null;
    }
    const defaultTextColor = bannerFields.backgroundImage ? "white" : "black";
    return (
        <div
            css={css`
                display: flex;
                flex-direction: column;
                overflow: hidden;

                *,
                a {
                    color: ${bannerFields.textColor || defaultTextColor};
                    font-size: 14pt;
                }
                a:visited {
                    text-decoration: underline;
                }
                background-color: ${bannerFields.backgroundColor};

                /* this can override any of the above*/
                ${bannerFields.css}
            `}
        >
            {(bannerFields.backgroundColor && (
                <ImageOnRightBannerLayout
                    {...props}
                    bannerFields={bannerFields}
                />
            )) || (
                <StandardBannerLayout {...props} bannerFields={bannerFields} />
            )}
        </div>
    );
};

import React, { useState } from "react"; // see https://github.com/emotion-js/emotion/issues/1156
import { useContentful } from "react-contentful";
import { IFilter } from "../../IFilter";
import { ICollection } from "../../model/ContentInterfaces";
import { convertContentfulBannerToIBanner } from "../../model/Contentful";
import { Banner } from "./Banner";
export const ContentfulBanner: React.FunctionComponent<{
    id: string; // of the banner object on contentful
    collection: ICollection;
    filter?: IFilter;
    bookCount?: string; // often undefined, meaning compute from filter
}> = (props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const banner = convertContentfulBannerToIBanner((data as any).fields);
    // I don't know why this happens, but sometimes data comes back as a promise instead of
    // the actual data. Reproduction steps as of May 18 2020: Navigate from home page through
    // Enabling Writers to American University of Nigeria, then to the More page for level 1,
    // then click the Breadcrumb for American University of Nigeria. As the resulting page
    // is drawn, we get data here being a promise.
    // The gotData flag and calling setGotData here are  just a trick to re-render when the data
    // is really available.
    // This appears to be a bug in the useContentful code, and of course it could return a
    // promise more than once; but so far this has proved a sufficient work-around.
    if (!banner && (data as any).then) {
        (data as any).then(() => setGotData(true));
        return null;
    }
    return <Banner banner={banner} collection={props.collection} />;
};

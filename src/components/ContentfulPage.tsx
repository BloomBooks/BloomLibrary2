import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
import { useContentful } from "react-contentful";
/** @jsx jsx */
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
export const ContentfulPage: React.FunctionComponent<{ slug: string }> = (
    props
) => {
    const { data, error, fetched, loading } = useContentful({
        contentType: "page",
        query: {
            "fields.slug": `${props.slug}`,
        },
    });
    if (loading || !fetched) {
        return null;
    }

    if (error) {
        console.error(error);
        return null;
    }

    if (!data) {
        return <p>Page does not exist.</p>;
    }
    console.debug(data);

    return (
        <div>
            {documentToReactComponents((data as any).items[0].fields.body)}
        </div>
    );
};

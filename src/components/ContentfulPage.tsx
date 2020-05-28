import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
import { useContentful } from "react-contentful";
/** @jsx jsx */
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import ReactMarkdown from "react-markdown";

export const ContentfulPage: React.FunctionComponent<{ urlKey: string }> = (
    props
) => {
    const { data, error, fetched, loading } = useContentful({
        contentType: "page",
        query: {
            "fields.urlKey": `${props.urlKey}`,
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
        <div
            css={css`
                margin-left: 30px;
                margin-right: 30px;
                h1 {
                    font-size: 2rem;
                }
                img {
                    width: 200px;
                }
            `}
        >
            <ReactMarkdown
                escapeHtml={false}
                source={(data as any).items[0].fields.markdownBody}
            />
            {/* Maybe we're going to remove this Richtext option entirely? Depend if we can get people to work in Markdown */}
            {documentToReactComponents((data as any).items[0].fields.body)}
        </div>
    );
};

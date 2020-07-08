import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import ReactMarkdown from "react-markdown";
import { useContentful } from "../connection/UseContentful";
import { useDocumentTitle } from "./Routes";

export const ContentfulPage: React.FunctionComponent<{ urlKey: string }> = (
    props
) => {
    useDocumentTitle(props.urlKey);
    const { loading, result: data } = useContentful({
        content_type: "page",
        "fields.urlKey": `${props.urlKey}`,
        include: 10,
    });
    if (loading || !data) {
        return null;
    }

    if (!data || data.length === 0) {
        throw Error("404: " + props.urlKey);
    }

    const page = data[0];

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
                source={page.fields.markdownBody}
            />
            {/* Maybe we're going to remove this Richtext option entirely? Depend if we can get people to work in Markdown */}
            {documentToReactComponents(page.fields.body)}
        </div>
    );
};

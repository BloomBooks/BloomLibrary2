import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { ContentfulBasePage, useContentfulPage } from "./ContentfulBasePage";
import { ContentfulMarkdownPart } from "../ContentfulMarkdownPart";

export const ContentfulPage: React.FunctionComponent<{ urlKey: string }> = (
    props
) =>{
    const page = useContentfulPage("page", props.urlKey);
    if (!page) {
        return null;
    }
    const markdownContent = page.fields.markdownBody as string;
    const innards = (
        <div
            css={css`
                max-width: 1000px;
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
            {/* Insert our custom components when the markdown has HTML that calls for them */}
            {/* Could not get this to compile <Markdown> {markdownContent} </Markdown> */}
            {/* {options:{overrides:{h1:{component:WindowsInstallerDownloads, props:{}}}}} */}
            {markdownContent
                ? <ContentfulMarkdownPart markdown={markdownContent} />
                : documentToReactComponents(page.fields.body)}
        </div>
    );

    return (<ContentfulBasePage urlKey={props.urlKey}>{innards}</ContentfulBasePage>);
};

import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { ContentfulBasePage, useContentfulPage } from "./ContentfulBasePage";
import { ContentfulMarkdownPart } from "../ContentfulMarkdownPart";

export const ContentfulPage: React.FunctionComponent<{ urlKey: string }> = (
    props
) => {
    const page = useContentfulPage("page", props.urlKey);
    if (!page) {
        return null;
    }
    const markdownContent = page.fields.markdownBody as string;
    const innards = (
        <div className={`base-contentful-page contentful-page ${props.urlKey}`}>
            {/* Insert our custom components when the markdown has HTML that calls for them */}
            {/* Could not get this to compile <Markdown> {markdownContent} </Markdown> */}
            {/* {options:{overrides:{h1:{component:WindowsInstallerDownloads, props:{}}}}} */}
            {markdownContent
                ? <ContentfulMarkdownPart markdown={markdownContent}/>
                : documentToReactComponents(page.fields.body)}
        </div>
    );

    return (
        <ContentfulBasePage urlKey={props.urlKey}>{innards}</ContentfulBasePage>
    );
};

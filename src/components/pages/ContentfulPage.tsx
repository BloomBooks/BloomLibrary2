import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { ContentfulBasePage, useContentfulPage } from "./ContentfulBasePage";
import { ContentfulMarkdownPart } from "../ContentfulMarkdownPart";
import Container from "@material-ui/core/Container";

export const ContentfulPage: React.FunctionComponent<{ urlKey: string }> = (
    props
) => {
    const page = useContentfulPage("page", props.urlKey);
    if (!page) {
        return null;
    }
    const innards = (
        <div className={`base-contentful-page contentful-page ${props.urlKey}`}>
            {/* Insert our custom components when the markdown has HTML that calls for them */}
            {/* Could not get this to compile <Markdown> {markdownContent} </Markdown> */}
            {/* {options:{overrides:{h1:{component:WindowsInstallerDownloads, props:{}}}}} */}
            {page.markdownBody ? (
                <ContentfulMarkdownPart markdown={page.markdownBody} />
            ) : (
                documentToReactComponents(page.fields.body)
            )}
        </div>
    );

    return (
        <Container maxWidth="md">
            <ContentfulBasePage urlKey={props.urlKey}>
                {innards}
            </ContentfulBasePage>
        </Container>
    );
};

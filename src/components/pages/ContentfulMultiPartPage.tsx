import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
import { ContentfulBasePage, useContentfulPage } from "./ContentfulBasePage";
import { ContentfulMarkdownPart, Column } from "../ContentfulMarkdownPart";

// This is used (as of the time of this writing) just for the About Bloom page with all its
// color-banded sections describing Bloom.
export const ContentfulMultiPartPage: React.FunctionComponent<{
    urlKey: string;
}> = (props) => {
    const page = useContentfulPage("multiPartPage", props.urlKey);
    if (!page) {
        return null;
    }

    const innards = (
        <div className={`base-contentful-page multipart-contentful-page ${props.urlKey}`}>
            {page.fields.parts.map((part: any, index: number) => (
                <div>
                    <ContentfulMarkdownPart markdown={part.fields.primary} column={Column.leftColumn}/>
                    {part.fields.secondary && (
                        <ContentfulMarkdownPart
                            markdown={part.fields.secondary}
                            column={Column.rightColumn}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    return (<ContentfulBasePage urlKey={props.urlKey}>{innards}</ContentfulBasePage>);
};

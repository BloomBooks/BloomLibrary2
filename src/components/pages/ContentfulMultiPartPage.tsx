import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
import { ThemeForLocation } from "./ThemeForLocation";
import { BlorgMarkdown, Column } from "../BlorgMarkdown";
import { useContentfulPage } from "./ContentfulPage";

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
        <div
            className={`base-contentful-page multipart-contentful-page ${props.urlKey}`}
        >
            {page.fields.parts.map((part: any, index: number) => (
                <div key={index}>
                    <BlorgMarkdown
                        markdown={part.fields.primary}
                        column={Column.leftColumn}
                    />
                    {part.fields.secondary && (
                        <BlorgMarkdown
                            markdown={part.fields.secondary}
                            column={Column.rightColumn}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    return <ThemeForLocation urlKey={props.urlKey}>{innards}</ThemeForLocation>;
};

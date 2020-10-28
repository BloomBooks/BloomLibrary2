import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { ContentfulBasePage, useContentfulPage } from "./ContentfulBasePage";
import { ContentfulMarkdownPart } from "../ContentfulMarkdownPart";

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
        <div css={css`
            max-width: 1000px;
            margin-left: 30px;
            margin-right: 30px;
            h1 {
                font-size: 2rem;
            }
            img {
                width: 100%;
                max-width: 620px;
            }
            ul {
                list-style: inside;
                margin-left: 20px;
                list-style-type: square;
            }
            ul ul {
                list-style-type: circle;
            }`}
        >
            {page.fields.parts.map((part: any) => (
                <div>
                    <ContentfulMarkdownPart markdown={part.fields.primary} />
                    {part.fields.secondary && (
                        <ContentfulMarkdownPart
                            markdown={part.fields.secondary}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    return (<ContentfulBasePage urlKey={props.urlKey}>{innards}</ContentfulBasePage>);
};

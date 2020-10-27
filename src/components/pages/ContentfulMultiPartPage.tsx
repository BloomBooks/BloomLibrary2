import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
//import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useContentful } from "../../connection/UseContentful";
import { useDocumentTitle } from "../Routes";
import Markdown from "markdown-to-jsx";
import { WindowsInstallerDownload } from "../WindowsInstallerDownload";
import { BloomReaderVersionNumber } from "../BloomReaderVersionNumber";
import { CreationThemeProvider } from "../../theme";
import Link from "@material-ui/core/Link";
import { useLocation } from "react-router-dom";

// This is used (as of the time of this writing) just for the About Bloom page with all its
// color-banded sections describing Bloom.
export const ContentfulMultiPartPage: React.FunctionComponent<{
    urlKey: string;
}> = (props) => {
    useDocumentTitle(props.urlKey);
    const inCreate =
        useLocation().pathname.toLowerCase().indexOf("create") > -1;

    const { loading, result: data } = useContentful({
        content_type: "multiPartPage",
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

    if (inCreate) {
        return <CreationThemeProvider>{innards}</CreationThemeProvider>;
    } else {
        return <React.Fragment>{innards}</React.Fragment>;
    }
};

export const ContentfulMarkdownPart: React.FunctionComponent<{
    markdown: string;
}> = (props) => {
    return React.createElement(Markdown, {
        options: {
            overrides: {
                a: {
                    component: Link,
                },
                WindowsInstallerDownload: {
                    component: WindowsInstallerDownload,
                },
                BloomReaderVersionNumber: {
                    component: BloomReaderVersionNumber,
                },
            },
        },
        children: props.markdown,
    });
};

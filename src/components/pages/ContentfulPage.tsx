import { css } from "@emotion/react";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { ThemeForLocation } from "./ThemeForLocation";
import { BlorgMarkdown } from "../markdown/BlorgMarkdown";
import Container from "@material-ui/core/Container";
import { convertContentfulMediaToIMedia } from "../../model/Contentful";
import { IMedia } from "../../model/ContentInterfaces";
import { useContentful } from "../../connection/UseContentful";

export interface IContentfulPage {
    urlKey: string;
    // The text label we show on the card
    label: string;
    markdownBody: string;
    hideTitle: boolean;

    // A sentence that is shown when we're showing a story card
    excerpt?: string;
    // A card that  is shown when we're showing a story card
    cardImage?: IMedia;
    // A grey-text like the name of the country or some other topic for stories
    category: string;

    // NB: purposefully missing here are "body" and "parts" which are probably going away.
    // For now, those can be accessed via the raw fields tag
    fields: any;
    css?: string;
}

export const ContentfulPage: React.FunctionComponent<{ urlKey: string }> = (
    props
) => {
    const page = useContentfulPage("page", props.urlKey);
    if (!page) {
        return null;
    }

    const titleElementIfWanted = page.hideTitle ? undefined : (
        <h1>{page.label}</h1>
    );

    const innards = (
        <div
            className={`base-contentful-page contentful-page ${props.urlKey}`}
            css={css`
                ${page.css}
                img {
                    // Before changing this see the image at https://bloomlibrary.org/page/resources/creators-Chetana in a phone-size screen.
                    max-width: 100%;
                }
            `}
        >
            {titleElementIfWanted}

            {/* Insert our custom components when the markdown has HTML that calls for them */}
            {/* Could not get this to compile <Markdown> {markdownContent} </Markdown> */}
            {/* {options:{overrides:{h1:{component:WindowsInstallerDownloads, props:{}}}}} */}
            {page.markdownBody ? (
                <BlorgMarkdown markdown={page.markdownBody} />
            ) : (
                documentToReactComponents(page.fields.body)
            )}
        </div>
    );

    // "about" has a more challenging layout with background colors that look bad
    // if enclosed in a container that adds whitespace on the sides. Instead,
    // the color has to be edge-to-edge. If we did more of this, then we could
    // introduce some kind of layout field, but for now, yagni.
    if (props.urlKey === "about") {
        return (
            <ThemeForLocation browserTabTitle={page.label || props.urlKey}>
                {innards}
            </ThemeForLocation>
        );
    } else
        return (
            <Container maxWidth="md">
                <ThemeForLocation browserTabTitle={page.label || props.urlKey}>
                    {innards}
                </ThemeForLocation>
            </Container>
        );
};

export function useContentfulPage(
    contentType: string,
    urlKey: string
): IContentfulPage | undefined {
    const { loading, result: data } = useContentful({
        content_type: `${contentType}`,
        "fields.urlKey": `${urlKey}`,
        include: 10,
    });

    if (loading || !data) {
        return undefined;
    }

    if (!data || data.length === 0) {
        throw Error("404: " + urlKey);
    }
    const p = data[0];
    if (!p) {
        return undefined;
    }

    return {
        urlKey: p.fields.urlKey,
        label: p.fields.label,
        markdownBody: p.fields.markdownBody,
        hideTitle: p.fields.hideTitle || false,
        fields: p.fields,
        // the following are used when we are showing a "story card" (like for blog posts)
        cardImage: p.fields.iconForCardAndDefaultBanner
            ? convertContentfulMediaToIMedia(
                  p.fields.iconForCardAndDefaultBanner // note, despite the name,this isn't necessarily an icon... can be any image
              )
            : undefined,
        excerpt: p.fields.excerpt,
        category: p.fields.category,
        css: p.fields.css,
    };
}

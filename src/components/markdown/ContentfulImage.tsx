// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import * as React from "react";
import { getContentfulClient } from "../../ContentfulContext";

export const ContentfulImage: React.FunctionComponent<{
    id: string;
    className?: string;
}> = (props) => {
    const [url, setUrl] = React.useState<string>();
    const [description, setDescription] = React.useState<string>();
    React.useEffect(() => {
        getContentfulClient()
            // Ideally we would instead use the asset title, but it does not appear
            // possible to query for that at this time.
            .getAsset(props.id)
            .then((asset) => {
                setUrl(asset.fields.file.url);
                setDescription(asset.fields.description);
            });
    }, [props.id]);
    return (
        <img
            src={url}
            alt={description}
            css={css`
                width: 100%;
            `}
            {...props}
        ></img>
    );
};

// just an image styled in a default way useful when making blog-post-like stories
export const StoryImage: React.FunctionComponent<{
    id: string;
}> = (props) => (
    <ContentfulImage
        {...props}
        css={css`
            max-width: 100%;
            // Conceivably these rules should only apply to stories? If they start to
            // mess up other kinds of pages, then we can deal with that.
            margin-top: 14px;
            margin-bottom: 14px;
            display: block; // makes the following centering rules work
            margin-left: auto;
            margin-right: auto;
        `}
    />
);

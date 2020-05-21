// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";

import { Book } from "../../model/Book";
import { FacebookShareButton, FacebookIcon } from "react-share";
import { getHarvesterProducedThumbnailUrl } from "./ArtifactHelper";
const encodeUrl = require("encodeurl");

export const SharingButtons: React.FunctionComponent<{ book: Book }> = (
    props
) => {
    const url = `http://social.bloomlibrary.org/v1/social?img=${getHarvesterProducedThumbnailUrl(
        props.book,
        300
    )}&width=300&height=300&description=${encodeUrl(props.book.summary)}&link=${
        window.location
    }`;
    console.log(url);
    return (
        <FacebookShareButton url={url}>
            {/*
    // @ts-ignore:               https://github.com/nygardk/react-share/issues/277 */}
            <FacebookIcon size={24} />
        </FacebookShareButton>
    );
};

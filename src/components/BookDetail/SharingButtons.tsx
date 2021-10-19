import React from "react";

import { Book } from "../../model/Book";
import { FacebookShareButton, FacebookIcon } from "react-share";
import { getHarvesterProducedThumbnailUrl } from "./ArtifactHelper";
const encodeUrl = require("encodeurl");

export const SharingButtons: React.FunctionComponent<{ book: Book }> = (
    props
) => {
    // The previews will fail if the link is to localhost
    const location = window.location.href.replace(
        "http://localhost:3000",
        "https://bloomlibrary.org"
    );
    const url = `https://social.bloomlibrary.org/v1/social?img=${getHarvesterProducedThumbnailUrl(
        props.book,
        "300x300"
    )}&width=300&height=300&title=${encodeUrl(props.book.title)}${
        props.book.summary
            ? "&description=" + encodeUrl(props.book.summary)
            : ""
    }&link=${location}`;
    console.log(url);
    return (
        <FacebookShareButton url={url}>
            {/*
    // @ts-ignore:               https://github.com/nygardk/react-share/issues/277 */}
            <FacebookIcon size={24} />
        </FacebookShareButton>
    );
};

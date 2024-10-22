// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import React from "react";

import { Book } from "../../model/Book";
import FacebookIcon from "@material-ui/icons/Facebook";
import { IconButton } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import { useLocation } from "react-router-dom";
import { getContextLangTagFromUrlSearchParams } from "../Routes";

export const SharingButtons: React.FunctionComponent<{ book: Book }> = (
    props
) => {
    const contextLangTag = getContextLangTagFromUrlSearchParams(
        new URLSearchParams(useLocation().search)
    );
    const bestTitle = props.book ? props.book.getBestTitle(contextLangTag) : "";

    // The previews will fail if the link is to localhost
    const location = window.location.href.replace(
        "http://localhost:3000",
        "https://bloomlibrary.org"
    );
    const url = `https://social.bloomlibrary.org/v1/social?img=${Book.getHarvesterProducedThumbnailUrl(
        props.book,
        "300x300"
    )}&width=300&height=300&title=${encodeURIComponent(bestTitle)}${
        props.book.summary
            ? "&description=" + encodeURIComponent(props.book.summary)
            : ""
    }&link=${location}`;

    return (
        <IconButton
            color="secondary"
            size="small"
            css={css`
                flex-shrink: 1;
                margin-right: 20px !important;
                display: flex;
                align-items: center;
                margin-top: 10px !important;
            `}
            onClick={() => {
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        url
                    )}`,
                    "Facebook",
                    // the resulting popup auto-expands if facebook wants it to
                    "width=550,height=550"
                );
            }}
        >
            <FacebookIcon
                css={css`
                    margin-right: 3px;
                `}
            />
            <div>
                <FormattedMessage id="book.share" defaultMessage="Share" />
            </div>
        </IconButton>
    );
};

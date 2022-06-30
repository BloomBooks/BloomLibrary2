// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import Button from "@material-ui/core/Button";
import HomeIcon from "@material-ui/icons/Home.js";
import SearchIcon from "@material-ui/icons/Search.js";
import { commonUI } from "../../theme";
import { useHistory, useLocation } from "react-router-dom";
import { useGetCollection } from "../../model/Collections";
import { Helmet } from "react-helmet";

// A simple status page used when embedded in Bloom Reader to indicate we have started downloading
// a book and offer the user a couple of likely options for what to do next.
// Review: another very likely thing the user wants to do next is to escape from embedded-BL mode
// and read the book he just downloaded. Can we have a button here to make that easier?
export const ReaderDownloadingPage: React.FunctionComponent = (props) => {
    const l10n = useIntl();
    const { search } = useLocation();
    const params = useMemo(() => new URLSearchParams(search), [search]);
    const history = useHistory();
    const lang = params.get("lang");
    const { collection } = useGetCollection("language:" + lang);
    const weAreDownloading = l10n.formatMessage({
        id: "reader.weAreDownloading",
        defaultMessage:
            "Great! We are downloading that book now. It will appear in your list of books when the download is complete.",
    });
    const home = l10n.formatMessage({
        id: "header.home",
        defaultMessage: "Home",
    });
    let label = collection?.label;
    if (label) {
        // Some languages, e.g. English, have a non-generated label like "English Books"
        // which gives us a duplicated "books"
        label = label.replace(/\sBooks\b/, "");
    }
    const getMore = l10n.formatMessage(
        {
            id: "reader.getMoreBooks",
            defaultMessage: "Get more {label} books", // Review: mockup just has "More ...books"...if this is OK we can avoid having another string to localize.
        },
        { label }
    );
    const buttonCss = `width: 95%;
    max-width: 320px;
    margin-left: 20px;
    height: ${commonUI.detailViewMainButtonHeight};
    margin-bottom: 30px !important;`;
    return (
        <div>
            <Helmet>
                <title>
                    {l10n.formatMessage({
                        id: "reader.downloading",
                        defaultMessage: "Downloading",
                    })}
                </title>
            </Helmet>
            <div
                css={css`
                    padding: 20px;
                `}
            >
                {weAreDownloading}
            </div>
            {lang && (
                <Button
                    variant="contained"
                    color="secondary" // mockup uses a brigher green...why?
                    startIcon={<SearchIcon />}
                    size="large"
                    css={css`
                        ${buttonCss}
                    `}
                    onClick={() => history.push("/reader/language:" + lang)}
                >
                    {getMore}
                </Button>
            )}
            <Button
                variant="contained"
                color="primary"
                startIcon={<HomeIcon />}
                size="large"
                css={css`
                    ${buttonCss}
                `}
                onClick={() => {
                    history.push("/reader/langs");
                    // This can be detected by BloomReader.
                    (window as any).ParentProxy?.postMessage("go_home");
                }}
            >
                {home}
            </Button>
        </div>
    );
};

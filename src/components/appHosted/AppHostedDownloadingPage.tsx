import { css } from "@emotion/react";

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import Button from "@material-ui/core/Button";
import HomeIcon from "@material-ui/icons/Home.js";
import SearchIcon from "@material-ui/icons/Search.js";
import { commonUI } from "../../theme";
import { useHistory, useLocation } from "react-router-dom";
import { useGetCollection } from "../../model/Collections";
import { Helmet } from "react-helmet";
import { appHostedSegment } from "./AppHostedUtils";

// A simple status page used when embedded in Bloom Reader to indicate we have started downloading
// a book and offer the user a couple of likely options for what to do next.
// Review: another very likely thing the user wants to do next is to escape from embedded-BL mode
// and read the book he just downloaded. Can we have a button here to make that easier?
export const AppHostedDownloadingPage: React.FunctionComponent = (props) => {
    const l10n = useIntl();
    const { search } = useLocation();
    const params = useMemo(() => new URLSearchParams(search), [search]);
    const history = useHistory();
    const lang = params.get("lang");
    const { collection } = useGetCollection("language:" + lang);
    const weAreDownloading = l10n.formatMessage({
        id: "appHosted.weAreDownloading",
        defaultMessage:
            "Great! We are downloading that book now. It will appear in your list of books when the download is complete.",
    });
    const home = l10n.formatMessage({
        id: "usermenu.myBooks", // reusing this ID, but I think it's safe, and avoids adding another thing to localize.
        defaultMessage: "My Books",
    });
    const label = collection?.label;
    const getMore = l10n.formatMessage(
        {
            id: "appHosted.getMoreBooks",
            defaultMessage: "Get more {label} books", // Review: mockup just has "More ...books"...if what I have here is OK we can avoid having another string to localize.
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
                        id: "appHosted.downloading",
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
                    onClick={() =>
                        history.push(
                            "/" + appHostedSegment + "/language:" + lang
                        )
                    }
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
                    history.push("/" + appHostedSegment + "/langs");
                    // This can be detected by BloomReader. See class comment on WebAppInterface.
                    (window as any).ParentProxy?.postMessage("go_home");
                }}
            >
                {home}
            </Button>
        </div>
    );
};

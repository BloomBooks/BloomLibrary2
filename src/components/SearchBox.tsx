// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState, useEffect } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { Theme, InputBase, Paper, Grow } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CancelIcon from "@material-ui/icons/Cancel";
import { withStyles } from "@material-ui/styles";
import { giveFreeLearningCsv } from "../export/freeLearningIO";
import { useLocation, useHistory } from "react-router-dom";
import { useIntl } from "react-intl";

// NB: I tried a bunch of iterations over 2 days with forwardRefs and stuff trying to get this search box
// to have both the html tooltip AND stop losing focus every time a letter was typed. The upshot was this
// HtmlTooltip declaration was INSIDE of the SearchBox declaration. Moving it outside kept it from being
// rerendered every time a character was typed.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HtmlTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        maxWidth: 220,
        border: "1px solid #ccc",
        borderRadius: "6px",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "14px",
        paddingBottom: "14px",
        marginTop: "6px",
    },
    arrow: {
        color: theme.palette.background.default,
    },
}))(Tooltip);

export const SearchBox: React.FunctionComponent<{
    // Extra CSS props to apply to the root div. (A bit of a kludge; there's no clean way
    // to be able to use Emotion css both in the implementation of the component and
    // where it is invoked.)
    cssExtra?: string;
}> = (props) => {
    const location = useLocation();
    const history = useHistory();
    const search = location.pathname
        .split("/")
        .filter((x) => x.startsWith(":search:"))[0];

    const l10n = useIntl();
    let initialSearchString = search
        ? decodeURIComponent(search.substring(":search:".length))
        : "";
    if (initialSearchString.startsWith("phash")) {
        initialSearchString = "";
    }
    const [searchString, setSearchString] = useState(initialSearchString);
    // This is a bit subtle. SearchString needs to be state to get modified
    // as the user types. But another thing that can happen is that our location
    // changes as we follow links or switch from read to create. If something
    // brings in a new URL that has a different search specification, we
    // want the search box to update to match. Except when the user is actually
    // editing in the box, the box and the URL should be the same.
    // This must only happen when the url-derived initial search string changes,
    // otherwise, the user could not edit the box.
    useEffect(() => setSearchString(initialSearchString), [
        initialSearchString,
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showTooltip, setShowTooltip] = useState(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const searchTooltip: JSX.Element = (
        <Typography style={{ lineHeight: "1.25rem" }}>
            {"Press <Enter> to search"}
            <br />
            <br />
            <em>{"Example searches:"}</em>
            <br />
            <br />
            {"butterflies"}
            <br />
            {'"Moon and Cap"'}
            <br />
            {"fish topic:math"}
            <br />
            {"level:3 topic:animal stories"}
            <br />
            {"uploader:ken@examples.com"}
            <br />
            {"copyright:pratham"}
            <br />
        </Typography>
    );

    const handleSearch = () => {
        // These 'magic' strings cause a file to be written without changing the state of the page.
        if (
            searchString.toLowerCase() === "freelearningiocsv" ||
            searchString.toLowerCase() === "csv"
        ) {
            giveFreeLearningCsv();
            return;
        }
        if (searchString.length === 0) {
            // delete everything and press enter is the same as "cancel"
            cancelSearch();
            return;
        }
        // N.B. These 'grid' and 'covid' things need to be called from within 'handleSearch' to avoid
        // React errors about updating during state transitions.
        // enhance: we should just have a set of these keyword-->special page searches, not code for each.
        if (searchString === "grid") {
            // review: this replaces current history element...should we push instead? (Also below)
            history.push("/grid");
        } else if (
            ["covid", "covid19", "coronavirus", "cov19"].includes(
                searchString.toLowerCase()
            )
        ) {
            history.push("/covid19");
        } else if (searchString) {
            // We always get one empty string from before the leading slash.
            // We may get one at the end, too, if the path ends with a slash.
            // In particular if the path is just a slash (at the root), we start out with two empty strings.
            const pathParts = location.pathname.split("/").filter((x) => x);
            const existingSearchIndex = pathParts.findIndex((p) =>
                p.startsWith(":search:")
            );
            // we don't think it's useful to keep in history states that are just different searches.
            const replaceInHistory =
                existingSearchIndex >= 0 &&
                existingSearchIndex === pathParts.length - 1;
            // Commented out code allows search to be relative to current collection or subset
            // if (existingSearchIndex >= 0) {
            //     // remove the existing one and everything after it.
            //     pathParts.splice(
            //         existingSearchIndex,
            //         pathParts.length - existingSearchIndex
            //     );
            // }
            // pathParts.push(":search:" + encodeURIComponent(enteredSearch));
            // const newUrl = "/" + pathParts.join("/");

            // special case that when in create or grid mode, we don't want to leave it.
            const prefix =
                ["/create", "/grid", "/bulk"].find((x) =>
                    history.location.pathname.startsWith(x)
                ) || "";
            const newUrl =
                prefix + "/:search:" + encodeURIComponent(searchString);
            if (replaceInHistory) {
                history.replace(newUrl);
            } else {
                history.push(newUrl);
            }
        }
        // This doesn't affect regular searches as the search string will be updated by the new url,
        // but it ensures that special cases like 'grid' and 'covid19' disappear from the search box
        // when the new page appears.
        setSearchString("");
    };

    const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // search on 'Enter' key
        if (event.key === "Enter") {
            handleSearch();
            event.preventDefault();
            setShowTooltip(false);
        }
    };

    const cancelSearch = () => {
        setSearchString("");
        // searches can occur in /bulk as well as the main library, so
        // ensure we return whence we came.
        const searchIdx = location.pathname.indexOf("/:search:");
        if (searchIdx >= 0) {
            let newLocationPath = location.pathname.substr(0, searchIdx);
            if (newLocationPath.length === 0) {
                newLocationPath = "/";
            }
            history.push(newLocationPath);
        }
    };

    const searchTextField: JSX.Element = (
        <Paper
            key="searchField"
            css={css`
                display: inline-flex;
                height: 40px;
                margin-right: 20px;
                margin-top: 4px;
                margin-bottom: auto;
                border-radius: 6px !important;
                background-color: white;
                overflow: hidden;
                padding-left: 5px;
                ${props.cssExtra || ""}
            `}
            onFocus={() => setShowTooltip(true)}
            component="form"
            elevation={0}
        >
            <IconButton
                aria-label="search with Enter"
                onClick={handleSearch}
                css={css`
                    padding: 0px 8px 0px 0px !important;
                `}
            >
                <SearchIcon fontSize="large" color="disabled" />
            </IconButton>
            <InputBase
                css={css`
                    font-size: 1.45rem !important;
                `}
                placeholder={l10n.formatMessage({
                    id: "search.forBooks",
                    defaultMessage: "search for books",
                })}
                inputProps={{ "aria-label": "search for books" }}
                value={searchString}
                onChange={(event) =>
                    setSearchString(
                        event.target
                            .value /* no, don't trim yet else can't type space .trim()*/
                    )
                }
                onKeyPress={handleEnter}
            />
            <Grow in={!!searchString.trim()}>
                <IconButton
                    aria-label="cancel search"
                    onClick={() => cancelSearch()}
                    css={css`
                        padding: 0px 8px 0px 0px !important;
                    `}
                >
                    <CancelIcon fontSize="large" color="disabled" />
                </IconButton>
            </Grow>
        </Paper>
    );

    return (
        // (showTooltip && (
        //     <HtmlTooltip title={searchTooltip} arrow /*disableHoverListener*/>
        //         {searchTextField}
        //     </HtmlTooltip>
        // )) ||
        searchTextField
    );
};

export function CheckForCovidSearch(search?: string) {
    if (!search) return false;

    const searchTerms = search.toLowerCase();
    return (
        searchTerms.indexOf("covid") > -1 || searchTerms.indexOf("corona") > -1
    );
}

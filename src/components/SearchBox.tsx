// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState, useEffect, useContext } from "react";
import IconButton from "@material-ui/core/IconButton";
import { InputBase, Paper, Grow } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CancelIcon from "@material-ui/icons/Cancel";
import { useLocation, useHistory } from "react-router-dom";
import { useIntl } from "react-intl";
import { CachedTablesContext } from "../model/CacheProvider";
import { trySpecialSearch, noPushCode } from "../model/SpecialSearch";
import { isFacetedSearchString } from "../connection/LibraryQueryHooks";

//import Typography from "@material-ui/core/Typography";
//import Tooltip from "@material-ui/core/Tooltip";
//import { Theme } from "@material-ui/core";
//import { withStyles } from "@material-ui/styles";
// NB: I tried a bunch of iterations over 2 days with forwardRefs and stuff trying to get this search box
// to have both the html tooltip AND stop losing focus every time a letter was typed. The upshot was this
// HtmlTooltip declaration was INSIDE of the SearchBox declaration. Moving it outside kept it from being
// rerendered every time a character was typed.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const HtmlTooltip = withStyles((theme: Theme) => ({
//     tooltip: {
//         backgroundColor: theme.palette.background.default,
//         color: theme.palette.text.primary,
//         maxWidth: 220,
//         border: "1px solid #ccc",
//         borderRadius: "6px",
//         paddingLeft: "20px",
//         paddingRight: "20px",
//         paddingTop: "14px",
//         paddingBottom: "14px",
//         marginTop: "6px",
//     },
//     arrow: {
//         color: theme.palette.background.default,
//     },
// }))(Tooltip);

export enum SearchStyle {
    Empty,
    Special,
    Faceted,
    Shallow,
    Deeper,
}
export const SearchBox: React.FunctionComponent<{
    // Extra CSS props to apply to the root div. (A bit of a kludge; there's no clean way
    // to be able to use Emotion css both in the implementation of the component and
    // where it is invoked.)
    cssExtra?: string;
    setSearchResultStyle?: (searchResultStyle: SearchStyle) => void;
    initialSearchStyle?: SearchStyle;
}> = (props) => {
    const location = useLocation();
    const history = useHistory();

    const search = location.pathname
        .split("/")
        .filter((x) => x.startsWith(":search:"))[0];

    const [searchMode, setSearchMode] = useState(SearchStyle.Shallow);
    if (
        searchMode === SearchStyle.Shallow &&
        props.initialSearchStyle === SearchStyle.Deeper
    ) {
        setSearchMode(props.initialSearchStyle);
    }
    const l10n = useIntl();
    let initialSearchString = search
        ? decodeURIComponent(search.substring(":search:".length))
        : "";
    if (initialSearchString.startsWith("phash")) {
        initialSearchString = "";
    }
    if (
        searchMode === SearchStyle.Shallow &&
        initialSearchString.startsWith("title:")
    ) {
        // strip off the leading "title:" and the enclosing quotes.
        initialSearchString = initialSearchString
            .substring("title:".length + 1, initialSearchString.length - 1)
            .replace(/\\"/g, '"');
    }
    if (searchMode === SearchStyle.Deeper && initialSearchString.length > 0) {
        initialSearchString = "deeper:" + initialSearchString;
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

    const updateSearchResultStyle = (searchResultStyle: SearchStyle) => {
        setSearchMode(searchResultStyle);
        if (props.setSearchResultStyle) {
            props.setSearchResultStyle(searchResultStyle);
        }
    };

    //const [showTooltip, setShowTooltip] = useState(true);
    // const searchTooltip: JSX.Element = (
    //     <Typography style={{ lineHeight: "1.25rem" }}>
    //         {"Press <Enter> to search"}
    //         <br />
    //         <br />
    //         <em>{"Example searches:"}</em>
    //         <br />
    //         <br />
    //         {"butterflies"}
    //         <br />
    //         {'"Moon and Cap"'}
    //         <br />
    //         {"fish topic:math"}
    //         <br />
    //         {"level:3 topic:animal stories"}
    //         <br />
    //         {"uploader:ken@examples.com"}
    //         <br />
    //         {"copyright:pratham"}
    //         <br />
    //     </Typography>
    // );

    const { tags, languagesByBookCount } = useContext(CachedTablesContext);

    const handleSearch = () => {
        const trimmedSearchString = searchString.trim();
        if (trimmedSearchString.length === 0) {
            // delete everything and press enter is the same as "cancel"
            cancelSearch();
            updateSearchResultStyle(SearchStyle.Empty);
            return;
        }

        const searchStringLower = trimmedSearchString.toLocaleLowerCase();

        // N.B. Special search needs to be called from within 'handleSearch' to avoid
        // React errors about updating during state transitions.
        const specialSearchResults = trySpecialSearch(
            searchStringLower,
            languagesByBookCount
        );
        // For now, just assume the special search can only return 1 string (except in uilang case).
        // This will change someday (we are on phase 1 of 3, currently) to result in a page
        // that starts with collections that match the special search, followed by books that
        // match the (non-special) search.
        if (specialSearchResults.length > 0) {
            // A 'noPushCode' result tells us not to push anything to history, we're doing something
            // that has no side-effects on our url location. (Currently either uilang or csv).
            if (specialSearchResults[0] !== noPushCode) {
                history.push("/" + specialSearchResults[0]);
            }
            setSearchString("");
            updateSearchResultStyle(SearchStyle.Special);
            return;
        }

        const bookshelf = tryBookShelfSearch(searchStringLower, tags);
        if (bookshelf) {
            history.push("/" + bookshelf);
            setSearchString(bookshelf);
            updateSearchResultStyle(SearchStyle.Special);
            return;
        }

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
        let newUrl: string = "";
        if (trimmedSearchString.startsWith("deeper:")) {
            newUrl =
                prefix +
                "/:search:" +
                encodeURIComponent(
                    trimmedSearchString.substring("deeper:".length)
                );
            updateSearchResultStyle(SearchStyle.Deeper);
        } else if (isFacetedSearchString(trimmedSearchString)) {
            newUrl =
                prefix + "/:search:" + encodeURIComponent(trimmedSearchString);
            updateSearchResultStyle(SearchStyle.Faceted);
        } else {
            newUrl =
                prefix +
                '/:search:title%3A"' +
                encodeURIComponent(trimmedSearchString.replace(/"/g, '\\"')) +
                '"';
            updateSearchResultStyle(SearchStyle.Shallow);
        }
        //console.log(`DEBUG: SearchBox.handleSearch: newUrl=${newUrl}`);
        if (replaceInHistory) {
            history.replace(newUrl);
        } else {
            history.push(newUrl);
        }
    };

    const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // search on 'Enter' key
        if (event.key === "Enter") {
            handleSearch();
            event.preventDefault();
            //setShowTooltip(false);
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

    return (
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
            // @ts-ignore:next-line
            component="form"
            elevation={0}
            role="search"
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
                    width: 100%;
                `}
                placeholder={l10n.formatMessage({
                    id: "search.forBooks",
                    defaultMessage: "search for books",
                })}
                inputProps={{ "aria-label": "search for books" }}
                value={searchString}
                onChange={(event) =>
                    /* N.B. Don't trim the search string before setting it here, or you can't type space! */
                    setSearchString(event.target.value)
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

    //return (
    // (showTooltip && (
    //     <HtmlTooltip title={searchTooltip} arrow /*disableHoverListener*/>
    //         {searchTextField}
    //     </HtmlTooltip>
    // )) ||
    //searchTextField
    //);
};

// Search for a tag that starts with "bookshelf:" followed by the given search string.
// If any such tags are found, return the portion of the first tag after "bookshelf:".
// Otherwise, return null.
// This usually translates directly into a URL for a bookshelf, but it's possible that
// the bookshelf doesn't actually exist if no books are in it.
function tryBookShelfSearch(searchStringLower: string, tagList: string[]) {
    const foundTags: string[] = [];
    tagList.forEach((tag) => {
        if (tag.toLowerCase().startsWith("bookshelf:" + searchStringLower)) {
            foundTags.push(tag);
        }
    });
    if (foundTags.length > 0) {
        return foundTags[0].substring("bookshelf:".length);
    }
    return null;
}

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
import { setLanguageOverride } from "../localization/LocalizationProvider";
import { CachedTablesContext } from "../model/CacheProvider";
import { featureSpecs, getLocalizedLabel } from "./FeatureHelper";
import { trySpecialSearch } from "../model/SpecialSearch";

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

    const { languagesByBookCount } = useContext(CachedTablesContext);

    const handleSearch = () => {
        const trimmedSearchString = searchString.trim();
        if (trimmedSearchString.length === 0) {
            // delete everything and press enter is the same as "cancel"
            cancelSearch();
            return;
        }

        if (tryHandleSpecialSearch(trimmedSearchString)) {
            setSearchString("");
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
        const newUrl =
            prefix + "/:search:" + encodeURIComponent(trimmedSearchString);
        if (replaceInHistory) {
            history.replace(newUrl);
        } else {
            history.push(newUrl);
        }
    };

    async function giveFreeLearningCsvAsync() {
        const { giveFreeLearningCsv } = await import(
            "../export/freeLearningIO" /* webpackChunkName: "freeLearningCsv" */
        );
        giveFreeLearningCsv();
    }

    function tryHandleSpecialSearch(searchStringLocal: string): boolean {
        const searchStringLower = searchStringLocal.toLowerCase();

        // These 'magic' strings cause a file to be written without changing the state of the page.
        if (
            searchStringLower === "freelearningiocsv" ||
            searchStringLower === "csv"
        ) {
            giveFreeLearningCsvAsync();
            return true;
        }

        if (searchStringLower === "grid") {
            history.push("/grid");
            return true;
        }

        const specialSearchResults = trySpecialSearch(searchStringLower);
        if (specialSearchResults.length > 0) {
            // For now, just assume the special search can only return 1 string.
            // This will change someday (we are on phase 1 of 3, currently) to result in a page
            // that starts with collections that match the special search, followed by books that
            // match the (non-special) search.
            history.push("/" + specialSearchResults[0]);
            return true;
        }

        // Allow developers/testers to switch the uilang by typing "uilang=fr". Only marginally useful
        // because you loose it when you refresh. But it was going to be a pain to preserve it as
        // a url parameter. Note that you can change your lang in browser settings pretty easily for a
        // more permanent effect.
        if (searchStringLower.indexOf("uilang=") === 0) {
            setLanguageOverride(searchStringLower.split("=")[1]);
            return true;
        }

        if (tryHandleLanguageSearch(searchStringLower)) return true;
        if (tryHandleFeatureSearch(searchStringLower)) return true;

        return false;
    }

    function tryHandleLanguageSearch(searchStringLower: string): boolean {
        const matchingLanguage = languagesByBookCount.find(
            (l) =>
                l.name.toLowerCase() === searchStringLower ||
                l.englishName?.toLowerCase() === searchStringLower
        );
        if (matchingLanguage) {
            history.push(`/language:${matchingLanguage.isoCode}`);
            return true;
        }
        return false;
    }

    function tryHandleFeatureSearch(searchStringLower: string): boolean {
        const matchingFeature = featureSpecs.find(
            (f) =>
                f.englishLabel.toLowerCase() === searchStringLower ||
                getLocalizedLabel(f).toLowerCase() === searchStringLower
        );
        if (matchingFeature) {
            history.push(
                `/${
                    matchingFeature.collectionHref || matchingFeature.featureKey
                }`
            );
            return true;
        }
        return false;
    }

    const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // search on 'Enter' key
        if (event.key === "Enter") {
            handleSearch();
            event.preventDefault();
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
};

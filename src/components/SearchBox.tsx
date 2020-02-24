// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext, useState } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { Theme, InputBase, Paper, Grow } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CancelIcon from "@material-ui/icons/Cancel";
import { RouterContext } from "../Router";
import { withStyles } from "@material-ui/styles";

// NB: I tried a bunch of iterations over 2 days with forwardRefs and stuff trying to get this search box
// to have both the html tooltip AND stop losing focus every time a letter was typed. The upshot was this
// HtmlTooltip declaration was INSIDE of the SearchBox declaration. Moving it outside kept it from being
// rerendered every time a character was typed.
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
        marginTop: "6px"
    },
    arrow: {
        color: theme.palette.background.default
    }
}))(Tooltip);

export const SearchBox: React.FunctionComponent<{
    // Extra CSS props to apply to the root div. (A bit of a kludge; there's no clean way
    // to be able to use Emotion css both in the implementation of the component and
    // where it is invoked.)
    cssExtra?: string;
}> = props => {
    const router = useContext(RouterContext);
    const startSearch = router!.current.filter?.search
        ? router!.current.filter.search
        : "";
    const [search, setSearch] = useState(startSearch);

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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const processSearchString = (searchInput: string) => searchInput.trim();

    const handleSearchInner = () => {
        const searchString = processSearchString(search);
        if (searchString.length > 0) {
            const location = {
                title: `search for "${searchString}"`,
                pageType: "search",
                filter: {
                    ...router!.current.filter,
                    search: searchString
                }
            };
            router!.push(location);
        }
    };

    const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // search on 'Enter' key
        if (event.key === "Enter") {
            handleSearchInner();
            event.preventDefault();
        }
    };

    const cancelSearch = () => {
        const curFilter = router!.current.filter;
        // If the user previously pressed 'Enter' with this search text, we need to go back up the stack.
        if (curFilter?.search === processSearchString(search)) {
            window.history.back(); // Observable router will handle breadcrumbs.
        }
        setSearch("");
    };

    const searchTextField: JSX.Element = (
        <Paper
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
        >
            <IconButton
                aria-label="search with Enter"
                onClick={handleSearchInner}
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
                placeholder="search for books"
                inputProps={{ "aria-label": "search for books" }}
                value={search}
                onChange={handleChange}
                onKeyPress={handleEnter}
            />
            <Grow in={!!processSearchString(search)}>
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
        <HtmlTooltip title={searchTooltip} arrow disableHoverListener>
            {searchTextField}
        </HtmlTooltip>
    );
};

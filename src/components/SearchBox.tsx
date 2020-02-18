// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Theme } from "@material-ui/core";
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
        fontSize: theme.typography.pxToRem(12),
        border: "1px solid #ccc",
        borderRadius: "5",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "14px",
        paddingBottom: "14px"
    }
}))(Tooltip);

export const SearchBox: React.FunctionComponent = () => {
    const router = useContext(RouterContext);
    const startSearch = router!.current.filter?.search
        ? router!.current.filter.search
        : "";
    const [search, setSearch] = useState(startSearch);

    const searchTooltip: JSX.Element = (
        <Typography>
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

    const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // search on 'Enter' key
        if (event.key === "Enter") {
            const location = {
                title: `search for "${search}"`,
                pageType: "search",
                filter: {
                    ...router!.current.filter,
                    search
                }
            };
            router!.push(location);
        }
    };

    const cancelSearch = () => {
        setSearch("");
        // it may be that we need to do a window.history.back() if we aren't at the home page.
        // or a router!.pop();
    };

    const searchTextField: JSX.Element = (
        <TextField
            placeholder="search for books"
            margin="dense"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <IconButton
                            aria-label="search"
                            size="small"
                            disabled={true}
                        >
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
            value={search}
            onChange={handleChange}
        />
    );

    return (
        <div
            css={css`
                display: inline-flex;
                height: 40px;
                margin-right: 20px;
                margin-top: auto;
                margin-bottom: auto;
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: white;
                overflow: hidden;
            `}
            onKeyPress={handleEnter}
        >
            <HtmlTooltip title={searchTooltip}>{searchTextField}</HtmlTooltip>
            {search && (
                <IconButton onClick={() => cancelSearch()}>
                    <CancelIcon />
                </IconButton>
            )}
        </div>
    );
};

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext, useState } from "react";
import searchIcon from "../search.png";
import { RouterContext } from "../Router";
export const SearchBox: React.FunctionComponent<{}> = props => {
    const router = useContext(RouterContext);
    const [search, setSearch] = useState(
        router!.current.filter ? router!.current.filter.search : ""
    );
    return (
        <div
            className={
                "searchContainer " +
                css`
                    height: 30px;
                `
            }
        >
            <input
                css={css`
                    display: block;
                    border: 0;
                `}
                value={search || ""}
                onChange={e => {
                    setSearch(e.target.value);
                }}
                onKeyDown={e => {
                    if (e.keyCode === 13) {
                        // search on enter key
                        router!.push({
                            title: `search for "${(e.target as any).value}"`,
                            pageType: "search",
                            filter: {
                                ...router!.current.filter,
                                search: (e.target as any).value
                            }
                        });
                    }
                }}
            />
            <img src={searchIcon} alt="Search" />
        </div>
    );
};

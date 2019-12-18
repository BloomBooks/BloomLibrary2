import React, { useContext, useState } from "react";
import { css } from "emotion";
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
                    margin-left: auto;
                    height: 30px;
                `
            }
        >
            <input
                className={css`
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

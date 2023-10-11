import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Button, SvgIcon } from "@material-ui/core";
import { ReactComponent as SearchingDeeper } from "../assets/SearchingDeeper.svg";
import { commonUI } from "../theme";
import { useIntl } from "react-intl";
import { isFacetedSearchString } from "../connection/LibraryQueryHooks";

// This implements the "Search Deeper" button that appears on the search
// results page when appropriate.  All of the logic for determining whether
// to display the button is contained here, as well as the logic for when
// the button is clicked for a "deeper search".

export const SearchDeeper: React.FunctionComponent<{}> = (props) => {
    const location = useLocation();
    const history = useHistory();
    const l10n = useIntl();

    const [shallowSearchResults, setShallowSearchResults] = useState(false);
    useEffect(() => {
        let isShallow = false;
        const search = location.pathname
            .split("/")
            .filter((x) => x.startsWith(":search:"))[0];
        if (search) {
            const searchString = search.substring(":search:".length);
            isShallow =
                !searchString.startsWith("deeper:") &&
                !isFacetedSearchString(searchString);
        }
        setShallowSearchResults(isShallow);
    }, [location.pathname]);

    function HandleDeeperSearch(): void {
        const newPath = location.pathname.replace(
            /^\/:search:/,
            "/:search:deeper:"
        );
        history.push(newPath);
    }

    if (shallowSearchResults) {
        return (
            <Button
                variant="contained"
                css={css`
                    margin-left: 20px;
                    margin-bottom: 12px;
                    color: white;
                    background-color: ${commonUI.colors.bloomRed};
                    width: 160px;
                `}
                onClick={() => HandleDeeperSearch()}
            >
                <SvgIcon
                    css={css`
                        padding-right: 5px;
                        width: 39px;
                    `}
                    component={SearchingDeeper}
                    viewBox="0 0 39 33"
                ></SvgIcon>
                <div
                    css={css`
                        line-height: 1.2;
                        padding-top: 5px;
                        padding-bottom: 5px;
                    `}
                >
                    {l10n.formatMessage({
                        id: "header.searchDeeper",
                        defaultMessage: "Search Deeper",
                    })}
                </div>
            </Button>
        );
    } else {
        return null;
    }
};

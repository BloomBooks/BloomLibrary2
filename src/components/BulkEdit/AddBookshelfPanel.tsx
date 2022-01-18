// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { AddBookshelfToAllBooksInFilter } from "./BulkChangeFunctions";
import { CachedTablesContext } from "../../model/CacheProvider";

export const AddBookshelfPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
    backgroundColor: string;
}> = observer((props) => {
    const { bookshelves } = useContext(CachedTablesContext);
    return (
        <fieldset
            // This disables all input in its descendents.
            // (Temporary fix while working on BL-10838)
            disabled
            css={css`
                margin: 0;
                padding: 0;
            `}
        >
            <BulkEditPanel
                choices={bookshelves.map((b) => b.key)}
                panelLabel="Add Bookshelf"
                newValueLabel="New Bookshelf"
                actionButtonLabel="Add Bookshelf"
                performChangesToAllMatchingBooks={(
                    filter,
                    bookshelf,
                    refreshWhenDone
                ) =>
                    AddBookshelfToAllBooksInFilter(
                        filter,
                        bookshelf,
                        refreshWhenDone
                    )
                }
                {...props}
            />
        </fieldset>
    );
});

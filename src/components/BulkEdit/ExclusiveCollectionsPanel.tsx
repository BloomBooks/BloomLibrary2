// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { AddExclusiveCollectionToAllBooksInFilter } from "./BulkChangeFunctions";

export const ExclusiveCollectionsPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
    backgroundColor: string;
}> = observer((props) => {
    return (
        <fieldset
            css={css`
                margin: 0;
                padding: 0;
            `}
        >
            <BulkEditPanel
                panelLabel="Add Exclusive Collection"
                newValueLabel="urlKey of Contentful Collection (start with '-' to remove urlKey)"
                actionButtonLabel="Add Exclusive Collection"
                performChangesToAllMatchingBooks={(
                    filter,
                    bookshelf,
                    refreshWhenDone
                ) =>
                    AddExclusiveCollectionToAllBooksInFilter(
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

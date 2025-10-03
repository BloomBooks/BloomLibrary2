import React from "react";
import { IFilter } from "FilterTypes";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { ChangeColumnValueForAllBooksInFilter } from "./BulkChangeFunctions";

export const RequestHarvestPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
    backgroundColor: string;
}> = observer((props) => {
    return (
        <BulkEditPanel
            panelLabel="Request Harvest"
            newValueLabel="unused"
            actionButtonLabel="Request Harvest"
            performChangesToAllMatchingBooks={SetHarvestState}
            noValueNeeded={true}
            {...props}
        />
    );
});

async function SetHarvestState(
    filter: IFilter,
    unused: string,
    refresh: () => void
) {
    ReharvestAllBooksInFilter(filter, refresh);
}

export async function ReharvestAllBooksInFilter(
    filter: IFilter,
    refresh: () => void
) {
    ChangeColumnValueForAllBooksInFilter(
        filter,
        "harvestState",
        "Requested",
        refresh
    );
}

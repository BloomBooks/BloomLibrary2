import React, { useState } from "react";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { ChangeColumnValueForAllBooksInFilter } from "./BulkChangeFunctions";
import { Checkbox, FormControlLabel } from "@material-ui/core";

export const RebrandPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
    backgroundColor: string;
}> = observer((props) => {
    const [valueToPut, setValueToPut] = useState(true);
    return (
        <BulkEditPanel
            panelLabel={
                valueToPut
                    ? "Mark as a Rebranded copy of an existing book"
                    : "Remove Rebrand"
            }
            newValueLabel="unused"
            actionButtonLabel={
                valueToPut ? "Mark as Rebrands" : "Remove Rebrand Indicator"
            }
            performChangesToAllMatchingBooks={(
                filter: IFilter,
                tag: string,
                refresh: () => void
            ) => makeTheChange(valueToPut, filter, refresh)}
            noValueNeeded={true}
            {...props}
        >
            <FormControlLabel
                label={"Remove rebrand flag from selected books"}
                control={
                    <Checkbox
                        checked={!valueToPut}
                        onChange={(e) => setValueToPut(!e.target.checked)}
                    ></Checkbox>
                }
            ></FormControlLabel>
        </BulkEditPanel>
    );
});

async function makeTheChange(
    isRebrand: boolean,
    filter: IFilter,
    refresh: () => void
) {
    ChangeColumnValueForAllBooksInFilter(filter, "rebrand", isRebrand, refresh);
}

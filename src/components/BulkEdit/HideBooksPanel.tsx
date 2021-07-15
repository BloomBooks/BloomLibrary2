import React, { useState } from "react";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { ChangeColumnValueForAllBooksInFilter } from "./BulkChangeFunctions";
import { Checkbox, FormControlLabel } from "@material-ui/core";

export const HideBooksPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
    backgroundColor: string;
}> = observer((props) => {
    const [unhide, setUnhide] = useState(false);
    return (
        <BulkEditPanel
            panelLabel={unhide ? "Show Books" : "Hide Books"}
            newValueLabel="unused"
            actionButtonLabel={unhide ? "Show All" : "Hide All"}
            performChangesToAllMatchingBooks={(
                filter: IFilter,
                tag: string,
                refresh: () => void
            ) => MakeTheChange(unhide, filter, refresh)}
            noValueNeeded={true}
            {...props}
        >
            <FormControlLabel
                label={"Un-hide selected books"}
                control={
                    <Checkbox
                        checked={unhide}
                        onChange={(e) => setUnhide(e.target.checked)}
                    ></Checkbox>
                }
            ></FormControlLabel>
        </BulkEditPanel>
    );
});

async function MakeTheChange(
    unhide: boolean,
    filter: IFilter,
    refresh: () => void
) {
    ChangeColumnValueForAllBooksInFilter(
        filter,
        "inCirculation",
        unhide,
        refresh
    );
}

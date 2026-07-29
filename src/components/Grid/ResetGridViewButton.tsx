import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import SettingsBackupRestore from "@material-ui/icons/SettingsBackupRestore";

// A visually quiet escape hatch back to the factory-default grid view (columns, order, sort,
// widths -- not filters). Sits in the grid toolbar just left of the column chooser. Wired to
// useGridConfigInUrl's resetView, so it also forgets the personal saved view (localStorage);
// without it, a user with a mangled saved view has no non-technical way back to the default.
export const ResetGridViewButton: React.FunctionComponent<{
    onReset: () => void;
}> = (props) => (
    <Tooltip title="Reset the columns, sorting, and column widths to the default">
        <IconButton
            size="small"
            aria-label="reset grid view"
            onClick={props.onReset}
        >
            <SettingsBackupRestore fontSize="small" />
        </IconButton>
    </Tooltip>
);

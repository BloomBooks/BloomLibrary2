import { css } from "@emotion/react";

import { FormControlLabel, Checkbox } from "@material-ui/core";
import { Book } from "../../model/Book";
import React from "react";
import { observer } from "mobx-react-lite";

// Bind directly to the observable book.inCirculation (rather than a local
// useState copy) so the checkbox always reflects the book's current state and
// stays in sync with the Save/Cancel modified flag, matching the "Is a Rebrand"
// checkbox in StaffPanel. BL-16519.
export const HideBookControl: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = observer((props) => {
    return (
        <FormControlLabel
            css={css`
                width: 300px;
                background-color: ${props.book.inCirculation
                    ? "white"
                    : "orange"};
            `}
            control={
                <Checkbox
                    checked={!props.book.inCirculation}
                    onChange={(e) => {
                        props.book.inCirculation = !e.target.checked;
                        props.setModified(true);
                    }}
                />
            }
            label="Hide this Book from Everyone"
        />
    );
});

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import { css } from "@emotion/react";

import { FormControlLabel, Checkbox } from "@material-ui/core";
import { Book } from "../../model/Book";
import React, { useState } from "react";
export const HideBookControl: React.FunctionComponent<{
    book: Book;
    setModified: (modified: boolean) => void;
}> = (props) => {
    const [checked, setChecked] = useState(!props.book.inCirculation);
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
                    checked={checked}
                    onChange={(e) => {
                        props.book.inCirculation = !e.target.checked;
                        setChecked(e.target.checked);
                        props.setModified(true);
                    }}
                />
            }
            label="Hide this Book from Everyone"
        />
    );
};

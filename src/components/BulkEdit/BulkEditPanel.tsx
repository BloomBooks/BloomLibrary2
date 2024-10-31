import { css } from "@emotion/react";

import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import {
    Button,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
} from "@material-ui/core";

import { IFilter } from "../../IFilter";
import { observer } from "mobx-react-lite";
import { useGetLoggedInUser } from "../../connection/LoggedInUser";
import { FilterHolder } from "./BulkEditPage";

export const BulkEditPanel: React.FunctionComponent<{
    panelLabel: string;
    newValueLabel: string;
    actionButtonLabel: string;
    backgroundColor: string;
    // provide choices for a multiple choice panel
    choices?: string[];
    performChangesToAllMatchingBooks: (
        filter: IFilter,
        value: string,
        refresh: () => void
    ) => void;
    filterHolder: FilterHolder;
    refresh: () => void;
    noValueNeeded?: boolean;
}> = observer((props) => {
    const [valueToSet, setValueToSet] = useState<string | undefined>("");
    const [working, setWorking] = useState(false);
    const [armed, setArmed] = useState(false);
    const user = useGetLoggedInUser();

    //What we really want to say is that we want more of a filter than just incirculation, because
    // that means the operator is probably confused. It's not occurring to me how to say that, so
    // instead I'm just listing some likely filters; if I miss one, that's fine, we can add them.
    const notFilteredYet = !(
        !!props.filterHolder.completeFilter.otherTags ||
        !!props.filterHolder.completeFilter.language ||
        !!props.filterHolder.completeFilter.derivedFrom ||
        !!props.filterHolder.completeFilter.feature ||
        !!props.filterHolder.completeFilter.topic ||
        !!props.filterHolder.completeFilter.brandingProjectName ||
        // lots of other fields, e.g. copyright, end up as part of search (e.g. search:"copyright:foo")
        !!props.filterHolder.completeFilter.search
    );

    return (
        (user?.moderator && (
            <div
                css={css`
                    background-color: ${working
                        ? "lightGrey"
                        : props.backgroundColor};
                    border: solid thin;
                    border-radius: 5px;
                    padding: 10px;
                `}
            >
                <div
                    css={css`
                        display: flex;
                        justify-content: space-between;
                    `}
                >
                    <h2
                        css={css`
                            margin-top: 0;
                        `}
                    >
                        {props.panelLabel}
                    </h2>
                    <FormControlLabel
                        css={css`
                            margin-left: 20px;
                        `}
                        control={
                            <Checkbox
                                checked={armed}
                                onChange={(e) => {
                                    setArmed(e.target.checked);
                                }}
                            />
                        }
                        label="I know what I'm doing, I know there is no undo. Arm torpedoes."
                    />
                </div>

                <div
                    css={css`
                        display: flex;
                        justify-content: space-between;
                    `}
                >
                    {/* MULTIPLE CHOICE */}
                    {props.choices && (
                        <Select
                            displayEmpty={true}
                            value={valueToSet}
                            css={css`
                                width: 400px;
                            `}
                            onChange={(e) => {
                                setValueToSet(e.target.value as string);
                            }}
                        >
                            {props.choices.map((c) => (
                                <MenuItem key={c} value={c}>
                                    {c}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                    {/* TEXT FIELD */}
                    {!props.choices && !props.noValueNeeded && (
                        <TextField
                            variant="outlined"
                            label={props.newValueLabel}
                            css={css`
                                width: 600px;
                            `}
                            defaultValue={valueToSet}
                            onChange={(evt) => {
                                const v = evt.target.value.trim();
                                setValueToSet(v.length ? v : undefined);
                            }}
                        />
                    )}
                    {/* other controls */}
                    {props.children}

                    {notFilteredYet && (
                        <span
                            css={css`
                                color: red;
                                margin-top: auto;
                            `}
                        >
                            Filter the target set down first.
                        </span>
                    )}
                    <Button
                        variant="outlined"
                        css={css`
                            margin-top: 20px;
                            margin-left: auto;
                        `}
                        disabled={
                            !armed ||
                            working ||
                            // We currently do not allow setting a value to "", but we could change that if we need to set empty values.
                            (!valueToSet && !props.noValueNeeded) ||
                            // We currently do not allow setting every single book; it's too likely that this is a mistake.
                            notFilteredYet
                        }
                        onClick={() => {
                            if (valueToSet || props.noValueNeeded) {
                                setWorking(true);
                                props.performChangesToAllMatchingBooks(
                                    props.filterHolder.completeFilter,
                                    valueToSet || "not-used",
                                    () => {
                                        setWorking(false);
                                        props.refresh();
                                    }
                                );
                            }
                        }}
                    >
                        {working ? "Working..." : props.actionButtonLabel}
                    </Button>
                </div>
            </div>
        )) || (
            <div>
                ---- You must be logged in as a moderator to use this page ----
            </div>
        )
    );
});

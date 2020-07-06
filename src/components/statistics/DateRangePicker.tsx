// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState, FunctionComponent } from "react";

// NB: using a library outside of material-ui because, while they do have an internal calendar component,
// it seems to be undocumented aside from it saying it exists. People are reading the code to try and figure it out.
import "react-calendar/dist/Calendar.css";

import Calendar from "react-calendar";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import DateRangeIcon from "@material-ui/icons/DateRange";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export type IDateBoundary = Date | undefined;

export interface IDateRange {
    startDate: IDateBoundary;
    endDate: IDateBoundary;
    /* Future enhancement:
    namedRange?: undefined | "previousMonth" | "lastMonth" | "lastYear";
    */
}

// Why this is custom:
// This picker 1) shows a button affordance that tells the current range
// 2) when you click on it you get a clear representation of two calendars
// (much clearer than off-the-shelf picker)
// TODO: verify that it will show dates in local-sensitive ways
export const DateRangePicker: React.FunctionComponent<{
    range: IDateRange;
    setRange: (range: IDateRange) => void;
}> = (props) => {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <Button
                variant="contained"
                css={css`
                    background-color: white !important;
                `}
                onClick={() => setOpen(true)}
            >
                <DateRangeIcon></DateRangeIcon>
                <span
                    css={css`
                        margin-left: 10px;
                    `}
                >
                    {props.range.startDate
                        ? props.range.startDate.toLocaleDateString()
                        : "∞"}{" "}
                    —{" "}
                    {props.range.endDate
                        ? props.range.endDate.toLocaleDateString()
                        : "Today"}
                </span>
            </Button>
            {open && (
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                    <Paper
                        elevation={3}
                        css={css`
                            position: absolute;
                            right: 10px;
                            z-index: 1000;
                            background-color: white;
                            padding: 10px;
                            width: fit-content;
                            h4 {
                                text-align: center;
                                margin: 0;
                            }
                        `}
                    >
                        <div>
                            <Select
                                value={
                                    props.range.endDate === undefined &&
                                    props.range.startDate === undefined
                                        ? "∞"
                                        : "custom"
                                }
                                onChange={() => {
                                    props.setRange({
                                        startDate: undefined,
                                        endDate: undefined,
                                    });
                                }}
                                autoWidth
                                MenuProps={{
                                    disablePortal: true,
                                }}
                            >
                                <MenuItem value="∞">{"All Time"}</MenuItem>
                                <MenuItem disabled={true} value="custom">
                                    {"Custom"}
                                </MenuItem>
                            </Select>
                            <div>
                                <h4>Include Events From</h4>
                                <Calendar
                                    value={
                                        props.range.startDate
                                            ? props.range.startDate
                                            : new Date(2010, 1, 1)
                                    }
                                    onChange={(start: any) => {
                                        if (start)
                                            // We don't currently have a way to detect that they want to set the start back to infinity.
                                            props.setRange({
                                                ...props.range,
                                                startDate: start,
                                            });
                                    }}
                                ></Calendar>
                            </div>
                            <div
                                css={css`
                                    margin-top: 10px;
                                `}
                            >
                                <h4>To</h4>{" "}
                                <Calendar
                                    value={
                                        props.range.endDate
                                            ? props.range.endDate
                                            : new Date()
                                    }
                                    onChange={(d: Date | Date[]) => {
                                        const end = d as Date;
                                        if (end)
                                            props.setRange({
                                                ...props.range,
                                                // If they've chosen the current day as the end,
                                                // we presume they'd be happy if we just remember
                                                // it as "TODAY". That could be wrong, but then it's
                                                // easy for them to fix in the future when they want
                                                // to go and nail it down to that previous day.
                                                endDate:
                                                    end.getDate() ===
                                                    new Date().getDate()
                                                        ? undefined
                                                        : end,
                                            });
                                    }}
                                ></Calendar>
                            </div>
                        </div>
                    </Paper>
                </ClickAwayListener>
            )}
        </div>
    );
};

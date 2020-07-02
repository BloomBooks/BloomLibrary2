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

// Why this is custom:
// This picker 1) shows a button affordance that tells the current range
// 2) when you click on it you get a clear representation of two calendars
// (much clearer than off-the-shelf picker)
// TODO: verify that it will show dates in local-sensitive ways
export const DateRangePicker: React.FunctionComponent<{
    start: Date;
    end: Date;
    setRange: (from: Date, to: Date) => void;
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
                    {props.start.toLocaleDateString()} —{" "}
                    {props.end.toLocaleDateString()}
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
                            <div>
                                <h4>Include Events From</h4>
                                <Calendar
                                    value={props.start}
                                    onChange={(start: any) => {
                                        if (start)
                                            props.setRange(start, props.end);
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
                                    value={props.end}
                                    onChange={(end: any) => {
                                        if (end)
                                            props.setRange(props.start, end);
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

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState } from "react";

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
import { useIntl, FormattedMessage, IntlShape } from "react-intl";

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

    const l10n = useIntl();

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
                    {getPickerRangeString(props.range, l10n)}
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
                                <MenuItem value="∞">
                                    <FormattedMessage
                                        id="rangePicker.allTime"
                                        defaultMessage="All Time"
                                    />
                                </MenuItem>
                                <MenuItem disabled={true} value="custom">
                                    <FormattedMessage
                                        id="rangePicker.custom"
                                        defaultMessage="Custom"
                                    />
                                </MenuItem>
                            </Select>
                            <div>
                                <h4>
                                    {" "}
                                    <FormattedMessage
                                        id="rangePicker.from"
                                        defaultMessage="Include Events From"
                                    />
                                </h4>
                                <Calendar
                                    locale={l10n.locale}
                                    value={
                                        props.range.startDate
                                            ? getFakeUtcDate(
                                                  props.range.startDate
                                              )
                                            : new Date(2010, 1, 1)
                                    }
                                    onChange={(start: any) => {
                                        if (start)
                                            // We don't currently have a way to detect that they want to set the start back to infinity.
                                            props.setRange({
                                                ...props.range,
                                                startDate: toUTCDate(start),
                                            });
                                    }}
                                ></Calendar>
                            </div>
                            <div
                                css={css`
                                    margin-top: 10px;
                                `}
                            >
                                <h4>
                                    <FormattedMessage
                                        id="rangePicker.to"
                                        defaultMessage="To"
                                    />
                                </h4>
                                <Calendar
                                    locale={l10n.locale}
                                    value={
                                        props.range.endDate
                                            ? getFakeUtcDate(
                                                  props.range.endDate
                                              )
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
                                                    end.toDateString() ===
                                                    new Date().toDateString()
                                                        ? undefined
                                                        : toUTCDate(end),
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

function toUTCDate(input: any): IDateBoundary {
    if (!input) {
        return undefined;
    }
    // The dates we get back from the calendar control are set to time 00:00:00.000
    // on the specified date in the LOCAL timezone of the computer, which is the evening
    // of the day before in negative timezones like the US. We want the same date,
    // but in UTC.
    const date = input as Date;
    const result = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    return result;
}

// This date should only be used for formatting output. It returns a date
// whose values in the current timezone are equal to the UTC values of the input.
// Typically it will have a different UTC time from the input, and not be valid
// for comparing with true dates. However, its various formatting functions will
// give the results we'd like to get if Date had functions like toUTCLocaleDateString().
export function getFakeUtcDate(input: Date): Date {
    return new Date(
        input.getUTCFullYear(),
        input.getUTCMonth(),
        input.getUTCDate(),
        input.getUTCHours(),
        input.getUTCMinutes(),
        input.getUTCSeconds(),
        input.getUTCMilliseconds()
    );
}

export function toUTCLocaleDateString(input: Date): string {
    return getFakeUtcDate(input).toLocaleDateString();
}

// this one is more contextual, using things like "all time" & "today" that are not good for charts/graphs that you might publish
export function getPickerRangeString(
    range: IDateRange,
    l10n: IntlShape
): string {
    return range.startDate || range.endDate
        ? (range.startDate ? toUTCLocaleDateString(range.startDate) : "∞") +
              " — " +
              (range.endDate
                  ? toUTCLocaleDateString(range.endDate)
                  : l10n.formatMessage({
                        id: "rangePicker.today",
                        defaultMessage: "Today",
                    }))
        : l10n.formatMessage({
              id: "rangePicker.allTime",
              defaultMessage: "All Time",
          });
}

export function getPublishableDateRangeString(
    range: IDateRange,
    giveEmptyIfAllTime: boolean,
    l10n: IntlShape // enhance: use this
): string {
    const formatFn = (d: Date) =>
        d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    if (giveEmptyIfAllTime && !range.startDate && !range.endDate) return "";
    let result = "";
    if (range.startDate) {
        result = `${formatFn(range.startDate)} -- `;
    } else {
        result = "Through "; // enhance: I18N
    }
    result += ` ${
        range.endDate ? formatFn(range.endDate) : formatFn(new Date(Date.now()))
    }`;
    return result;
}

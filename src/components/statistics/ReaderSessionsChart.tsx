// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Bar, LabelFormatter } from "@nivo/bar";
import { commonUI } from "../../theme";
import { useGetDailyBookEventStats } from "./useGetDailyBookEventStats";
import { IStatsPageProps } from "./StatsInterfaces";
import { useProvideDataForExport } from "../../export/exportData";
import { getFakeUtcDate } from "./DateRangePicker";
import { toYyyyMmDd } from "../../Utilities";
import { FormattedMessage, useIntl } from "react-intl";
import React from "react";

import { makeSimpleTitleLayer, ScreenOptionsRow } from "./CollectionStatsPage";
import { FormControl, MenuItem, Select } from "@material-ui/core";
import { useQueryParam } from "use-query-params";

// Given a UTC date, format as MMM YYYY
function toMmmYyyy(input: Date): string {
    const ds = getFakeUtcDate(input).toDateString(); // DDD MMM DD YYYY, locale-independent
    return ds.substring(4, 8) + ds.substring(11);
}

export const ReaderSessionsChart: React.FunctionComponent<IStatsPageProps> = (
    props
) => {
    const [groupingRaw, setGrouping] = useQueryParam<string | undefined>(
        "grouping"
    );
    const grouping = groupingRaw ? groupingRaw : "month";
    const byMonth = grouping === "month";

    const l10n = useIntl();
    const dayStats = useGetDailyBookEventStats(props);
    useProvideDataForExport(dayStats, props);

    if (!dayStats)
        return (
            <div>
                <FormattedMessage id="loading" defaultMessage="Loading..." />
            </div>
        );
    if (!dayStats.length) return <div>{"No data found"}</div>;

    const counts = new Map<string, number>();
    let maxCount = 0;
    // we are hardwired here to accept only a single option

    dayStats.forEach((dailyInfo) => {
        // Since dateEventLocal is formatted YYYY-MM-DD, we can reliably expect it to
        // be parsed as a UTC date.
        const date = new Date(dailyInfo.dateEventLocal);

        const key = byMonth ? toMmmYyyy(date) : getFirstDayOfWeekYyyyMmDd(date);

        const count = counts.get(key) || 0;
        const newCount = count + dailyInfo.bloomReaderSessions;
        maxCount = Math.max(maxCount, newCount);
        counts.set(key, newCount);
    });

    const mapData = Array.from(counts.keys()).map((x) => {
        return { date: x, sessionCount: counts.get(x) };
    });

    sortAndFillInMissingSteps(mapData, byMonth);

    // Items with values smaller than about this get zero pixels, and therefore
    // no bar or label, so they are indistinguishable from empty bars.
    const minVal = Math.ceil(maxCount / 120); // map has a bit more than 120px.

    // To fix it, we basically change them to have a value of minVal, which
    // makes them one pixel. However, for labels, we want to recover the original
    // value. Since the only input to the labelFormatter is the value itself,
    // we have to somehow encode the real value in the value, without significantly
    // changing the height of the bar beyond the zero-to-one pixel fix.
    // Since the values in this chart are all integers, we save the real
    // value in the fractional part of the number. Dividing by 100*maxCount
    // will make the fraction much less than one, so it won't have a noticeable affect
    // on the height of the bar, even if maxCount is small. To further ensure this,
    // we don't mess with things at all if a value of 1 is big enough to be visible.
    // Javascript floating point numbers seem to be very high precision, so I don't
    // think this will introduce errors unless the counts are absolutely enormous.
    // In charts with counts up to 4000 or so, the unrounded counts have zeros or
    // nines for about 8 digits, so we should be good up to about 400 billion
    // book events per day. If we get that many, I don't think people will worry
    // too much about small discrepancies on our off days.
    if (minVal > 1) {
        for (const item of mapData) {
            if (item.sessionCount && item.sessionCount <= minVal) {
                item.sessionCount = minVal + item.sessionCount / 100 / maxCount;
            }
            // item.date is expected to be YYYY-MM-DD, which seems to be reliably interpreted as UTC
            const date = new Date(item.date);
            const options = { timeZone: "UTC" };
            const label = date.toLocaleDateString(undefined, options);
            item.date = label;
        }
    }

    // Function to reverse the transformation in the loop above, for displaying
    // the real count. Values between minVal and minVal + 1 have the real value
    // encoded in their fractional part.
    const fixVal = (input: number) => {
        if (minVal > 1 && input >= minVal && input < minVal + 1) {
            return Math.round((input - minVal) * 100 * maxCount);
        }
        return input;
    };

    const labelFormatter: LabelFormatter = (((d: string | number) => {
        const input = fixVal(d as number);
        let label = input.toString();
        // For large numbers, give 2-3 digits precision plus an indicator,
        // e.g., 43M, 4.3M, 431K,43K,4.3K, 431, 43, 4.
        // The column width is set to be just enough to accommodate strings
        // this long.
        // When we get to more than 100M reader sessions on a day we may
        // need to enhance this, as the column is not quite wide enoug for 430M,
        // since M is a little wider than K.
        if (input >= 10000000) {
            label = Math.round(input / 1000000) + "M";
        } else if (input >= 1000000) {
            label = Math.round(input / 100000) / 10 + "M";
        } else if (input >= 10000) {
            label = Math.round(input / 1000) + "K";
        } else if (input >= 1000) {
            label = Math.round(input / 100) / 10 + "K";
        }
        return (
            <tspan
                y={d > maxCount / 10 ? 10 : -10}
                fill={d > maxCount / 10 ? "white" : commonUI.colors.bloomRed}
                //transform={"rotate(90)"} does not work on tspan
            >
                {label}
            </tspan>
            // We're really fighting typescript here. The labelFormat can, in fact, take a function
            // that returns a react svg element; but our type definitions don't know it.
        );
    }) as any) as LabelFormatter;
    // The 30px width here is critical to having the labels fit on the bars
    // (at least on Chrome on Windows...)
    const graphWidth = Math.max(600, 30 * mapData.length);

    return (
        <>
            <ScreenOptionsRow>
                <FormControl
                    className="choice-control"
                    variant="outlined"
                    size="small"
                    css={css`
                        margin-bottom: 1em;
                        * {
                            font-size: 0.875rem;
                        }
                        background-color: white;
                    `}
                >
                    <Select
                        value={grouping}
                        onChange={(e) => setGrouping(e.target.value as string)}
                        autoWidth
                    >
                        <MenuItem value="week">
                            {l10n.formatMessage({
                                id: "stats.options.By Week",
                                defaultMessage: "By Week",
                            })}
                        </MenuItem>
                        <MenuItem value="month">
                            {l10n.formatMessage({
                                id: "stats.options.By Month",
                                defaultMessage: "By Month",
                            })}
                        </MenuItem>
                    </Select>
                </FormControl>
            </ScreenOptionsRow>
            <div id="svg-wrapper" css={css``}>
                <Bar
                    data={mapData}
                    keys={["sessionCount"]}
                    indexBy="date"
                    groupMode={"stacked"}
                    layout={"vertical"}
                    height={200}
                    width={graphWidth}
                    colors={[commonUI.colors.bloomRed]}
                    labelSkipHeight={1} // attempt to make labels show on very short bars, did not work.
                    theme={{
                        background: "white",
                        //axis: { ticks: { text: { fill: "#eee" } } },
                        grid: {
                            line: {
                                stroke: "darkgrey",
                                strokeOpacity: 1,
                                strokeWidth: 1,
                            },
                        },
                    }}
                    // The default tooltip is designed to tell you which of several stacked
                    // datasets the hover applies to, and therefore includes a label
                    // and color block that are redundant for us. Just show which column
                    // it is and its full-precision value.
                    tooltip={(data) => {
                        const { value, indexValue } = data;
                        // const result = document.createElement("div");
                        // result.innerText = value.toString();
                        return (
                            <div>
                                {indexValue + ": "}{" "}
                                <strong>{fixVal(value)}</strong>
                            </div>
                        );
                    }}
                    labelTextColor="white"
                    labelFormat={labelFormatter}
                    gridYValues={[]}
                    axisLeft={{ tickValues: [] }}
                    // height/width need to include enough space for margin too
                    margin={{
                        top: 10,
                        right: 20,
                        bottom: 70,
                        left: 10,
                    }}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -90,
                        legendPosition: "middle",
                        legendOffset: 60,
                        //renderTick: () => <span>"x"</span>,
                    }}
                    layers={[
                        "grid",
                        "axes",
                        "bars",
                        "markers",
                        "legends",
                        makeSimpleTitleLayer("Bloom Reader Sessions"),
                    ]}
                ></Bar>
            </div>
        </>
    );
};

function getFirstDayOfWeekYyyyMmDd(date: Date): string {
    //const sunday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = getFakeUtcDate(date).getDay(); // no getUTCDay function
    const offset = day * 24 * 60 * 60 * 1000;
    const sunday = new Date();
    sunday.setTime(date.getTime() - offset);
    return toYyyyMmDd(sunday);
}

function sortAndFillInMissingSteps(
    items: Array<{ date: string; sessionCount: number | undefined }>,
    byMonth: boolean
): void {
    items.sort((a, b) => {
        if (a.date === b.date) return 0;
        return Date.parse(a.date) < Date.parse(b.date) ? -1 : 1;
    });

    // Fill in missing steps and insert them so that it looks right in the time-based x-axis
    let i = 0;

    while (i < items.length - 1) {
        let nextDate = new Date(items[i].date);
        let nextDateString: string; // the expected date for the next item on the x-axis
        if (byMonth) {
            if (nextDate.getUTCMonth() === 11) {
                // untested
                nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
                nextDate.setUTCMonth(0);
            } else {
                nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
            }
            nextDateString = toMmmYyyy(nextDate);
        } else {
            nextDate = new Date(nextDate.getTime() + 1000 * 60 * 60 * 24 * 7); // add seven days of milliseconds
            nextDateString = toYyyyMmDd(nextDate);
        }
        i++;

        if (items[i].date === nextDateString) {
            continue;
        }
        // not there yet, fill in another missing date and loop around
        items.splice(i, 0, { date: nextDateString, sessionCount: 0 });
    }
}

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
//import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Bar, LabelFormatter } from "@nivo/bar";
import { commonUI } from "../../theme";
import { useGetDailyBookEventStats } from "./useGetDailyBookEventStats";
import { IStatsProps } from "./StatsInterfaces";
import { useProvideDataForExport } from "./exportData";
import { getFakeUtcDate } from "./DateRangePicker";

interface IBookDownload {
    bookid: string;
    timeofshelldownload: string;
}

// Given a UTC date, format as MMM YYYY
function toMmmYyyy(input: Date): string {
    const ds = getFakeUtcDate(input).toDateString(); // DDD MMM DD YYYY, locale-independent
    return ds.substring(4, 8) + ds.substring(11);
}

function twoDigit(input: number): string {
    return input >= 10
        ? input.toString().substring(0, 2)
        : "0" + input.toString().substring(0);
}

// Given a UTC date, format as YYYY-MM-DD
export function toYyyyMmDd(date: Date) {
    const result =
        date.getUTCFullYear() +
        "-" +
        twoDigit(date.getUTCMonth() + 1) +
        "-" +
        twoDigit(date.getUTCDate());
    return result;
}

export const ReaderSessionsChart: React.FunctionComponent<IStatsProps> = (
    props
) => {
    const dayStats = useGetDailyBookEventStats(props);
    // if (dayStats) {
    //     console.log("daystats: " + JSON.stringify(dayStats));
    // }
    useProvideDataForExport(dayStats, props);

    if (!dayStats) return <h1>{"Loading..."}</h1>;

    const byMonth = false;
    const counts = new Map<string, number>();
    let maxCount = 0;

    dayStats.forEach((dailyInfo) => {
        // Since dateEventLocal is formatted YYYY-MM-DD, we can reliably expect it to
        // be parsed as a UTC date.
        const date = new Date(dailyInfo.dateEventLocal);
        const key = byMonth ? toMmmYyyy(date) : getFirstDayOfWeekYyyyMmDd(date);

        const count = counts.get(key) || 0;
        // The preceding plus signs make these add like numbers instead of concatenate like strings.
        const newCount = +count + +dailyInfo.bloomReaderSessions;
        maxCount = Math.max(maxCount, newCount);
        counts.set(key, newCount);
    });
    // props.registerDataMatrixFn(() => {
    //     return [[]];
    // });

    const mapData = Array.from(counts.keys()).map((x) => {
        return { date: x, sessionCount: counts.get(x) };
    });

    sortAndComplete(mapData, byMonth);

    const labelFormatter: LabelFormatter = (((d: string | number) => {
        const input = d as number;
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
        <div>
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
                            {indexValue + ": "} <strong>{value}</strong>
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
                    tickRotation: -45,
                    legendPosition: "middle",
                    legendOffset: 60,
                }}
            ></Bar>
        </div>
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

function sortAndComplete(
    items: Array<{ date: string; sessionCount: number | undefined }>,
    byMonth: boolean
): void {
    items.sort((a, b) => {
        if (a.date === b.date) return 0;
        return Date.parse(a.date) < Date.parse(b.date) ? -1 : 1;
    });
    let i = 0;
    while (i < items.length - 1) {
        let nextDate = new Date(items[i].date);
        if (byMonth) {
            if (nextDate.getUTCMonth() === 11) {
                // untested
                nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
                nextDate.setUTCMonth(0);
            } else {
                nextDate.setUTCMonth(nextDate.getMonth() + 1);
            }
        } else {
            nextDate = new Date(nextDate.getTime() + 1000 * 60 * 60 * 24 * 7); // add seven days of milliseconds
        }
        i++;
        const nextDateString = toYyyyMmDd(nextDate);
        if (items[i].date === nextDateString) {
            continue;
        }
        items.splice(i, 0, { date: nextDateString, sessionCount: 0 });
    }
}

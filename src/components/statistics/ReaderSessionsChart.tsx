// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Bar, LabelFormatter } from "@nivo/bar";

// Used for formatting dates... because... apparently vanilla JS doesn't support it out of the box?!?!?!
import moment from "moment";
import { commonUI } from "../../theme";
import { useGetDailyBookEventStats } from "./useGetDailyBookEventStats";
import { IStatsProps, IDailyBookStat } from "./StatsInterfaces";
import { useEffect } from "react";
import { useProvideDataForExport } from "./exportData";

interface IBookDownload {
    bookid: string;
    timeofshelldownload: string;
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
        const date = moment(dailyInfo.dateEventLocal);
        const key = byMonth ? date.format("MMM YYYY") : getWeek(date);

        const count = counts.get(key) || 0;
        const newCount = count + dailyInfo.bloomReaderSessions;
        maxCount = Math.max(maxCount, newCount);
        counts.set(key, newCount);
    });
    // props.registerDataMatrixFn(() => {
    //     return [[]];
    // });

    const mapData = Array.from(counts.keys()).map((x) => {
        return { date: x, sessionCount: counts.get(x) };
    });

    const labelFormatter: LabelFormatter = (((d: string | number) => (
        <tspan
            y={d > maxCount / 10 ? 10 : -10}
            fill={d > maxCount / 10 ? "white" : commonUI.colors.bloomRed}
        >
            {d}
        </tspan>
        // We're really fighting typescript here. The labelFormat can, in fact, take a function
        // that returns a react svg element; but our type definitions don't know it.
    )) as any) as LabelFormatter;
    const graphWidth = Math.max(600, 20 * mapData.length);

    return (
        <div
            // I'd prefer to use 100% - 40px, but one of our usual parents has width fit-content,
            // which figures out how wide the chart would be without overflow and makes that div
            // too wide. We'll have to find another answer if this chart is ever not the width of
            // the window.
            css={css`
                width: calc(100vw - 40px);
                overflow-x: scroll;
            `}
        >
            <Bar
                data={mapData}
                keys={["sessionCount"]}
                indexBy="date"
                groupMode={"stacked"}
                layout={"vertical"}
                height={200}
                width={graphWidth}
                colors={[commonUI.colors.bloomRed]}
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
                labelTextColor="white"
                labelFormat={labelFormatter}
                gridYValues={[]}
                axisLeft={{ tickValues: [] }}
                // height/width need to include enough space for margin too
                margin={{
                    top: 10,
                    right: 20,
                    bottom: 70,
                    left: 0,
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

function getWeek(date: moment.Moment) {
    const sunday = date.clone();
    sunday.day(0);
    return sunday.format("YYYY-MM-DD");
}

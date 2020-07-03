// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Bar, LabelFormatter } from "@nivo/bar";

// Used for formatting dates... because... apparently vanilla JS doesn't support it out of the box?!?!?!
import moment from "moment";
import { commonUI } from "../../theme";
import { IScreenProps } from "./CollectionStatsPage";

interface IBookDownload {
    bookid: string;
    timeofshelldownload: string;
}

interface IDailySessionsInfo {
    datelocal: string;
    bookbranding: string;
    country: string;
    bloomreadersessions: number;
}

// Temporary for testing
function getFakeCollectionStats(): IDailySessionsInfo[] {
    return [
        {
            datelocal: "2020-05-18T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 2,
        },
        {
            datelocal: "2020-05-19T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 3,
        },
        {
            datelocal: "2020-05-20T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 8,
        },
        {
            datelocal: "2020-05-27T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 40,
        },
        {
            datelocal: "2020-05-28T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 19,
        },
        {
            datelocal: "2020-06-18T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 6,
        },
        {
            datelocal: "2020-06-19T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 12,
        },
        {
            datelocal: "2020-06-22T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 43,
        },
        {
            datelocal: "2020-06-23T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 96,
        },
        {
            datelocal: "2020-06-23T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "United States",
            bloomreadersessions: 1,
        },
        {
            datelocal: "2020-06-24T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 87,
        },
        {
            datelocal: "2020-06-25T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 158,
        },
        {
            datelocal: "2020-06-26T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 58,
        },
        {
            datelocal: "2020-06-27T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 41,
        },
        {
            datelocal: "2020-06-28T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 113,
        },
        {
            datelocal: "2020-06-28T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Mexico",
            bloomreadersessions: 1,
        },
        {
            datelocal: "2020-06-29T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 127,
        },
        {
            datelocal: "2020-06-30T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Colombia",
            bloomreadersessions: 3,
        },
        {
            datelocal: "2020-06-30T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "Guatemala",
            bloomreadersessions: 97,
        },
        {
            datelocal: "2020-06-30T00:00:00.000Z",
            bookbranding: "Juarez-Guatemala",
            country: "United States",
            bloomreadersessions: 11,
        },
    ];
}

export const ReaderSessionsScreen: React.FunctionComponent<IScreenProps> = (
    props
) => {
    const stats = getFakeCollectionStats();
    return <ReaderSessionsChart stats={stats} backColor="white" />;
};

export const ReaderSessionsChart: React.FunctionComponent<{
    stats: IDailySessionsInfo[];
    backColor: string;
}> = (props) => {
    const byMonth = false;
    const counts = new Map<string, number>();
    const infoList = props.stats;
    let maxCount = 0;

    infoList.forEach((dailyInfo) => {
        const date = moment(dailyInfo.datelocal);
        const key = byMonth ? date.format("MMM YYYY") : getWeek(date);

        const count = counts.get(key) || 0;
        const newCount = count + dailyInfo.bloomreadersessions;
        maxCount = Math.max(maxCount, newCount);
        counts.set(key, newCount);
    });

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
    const graphWidth = 600;

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
                theme={{
                    background: props.backColor,
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

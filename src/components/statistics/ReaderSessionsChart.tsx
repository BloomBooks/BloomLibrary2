// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import { Bar, LabelFormatter } from "@nivo/bar";

// Used for formatting dates... because... apparently vanilla JS doesn't support it out of the box?!?!?!
import moment from "moment";
import { commonUI } from "../../theme";
import { ICollectionStatsResponse } from "./CollectionStatsPage";

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

// reinstate in place of getFakeCollectionStats once past initial
function getEmptyCollectionStats(): ICollectionStatsResponse {
    return { stats: [], devices: 0, languages: 0 };
}

export const ReaderSessionsChart: React.FunctionComponent<{
    responseData: ICollectionStatsResponse;
    backColor: string;
}> = (props) => {
    const byMonth = false;
    const counts = new Map<string, number>();
    const infoList = props.responseData.stats;
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
            <div
                // It would be nice if this was part of the chart, so it's included in any svg we
                // make for it...but so far I can't find any way to do so.
                css={css`
                    color: ${commonUI.colors.bloomRed};
                    background-color: ${props.backColor};
                    padding-top: 5px;
                    display: flex;
                    justify-content: space-around;
                    width: ${graphWidth}px;

                    font-size: smaller;
                `}
            >
                Bloom Reader Sessions
            </div>
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
                    axis: { ticks: { text: { fill: "#eee" } } },
                    grid: {
                        line: {
                            stroke: "white",
                            strokeOpacity: 1,
                            strokeWidth: 1,
                        },
                    },
                }}
                labelTextColor="white"
                labelFormat={labelFormatter}
                gridYValues={[0, maxCount]}
                axisLeft={{ tickValues: [0, maxCount] }}
                // height/width need to include enough space for margin too
                margin={{
                    top: 10,
                    right: 20,
                    bottom: 70,
                    left: 40,
                }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: "Date",
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

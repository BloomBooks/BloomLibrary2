// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useState } from "react";

import { ContentfulBanner } from "./banners/ContentfulBanner";
import { useGetCollection } from "../model/Collections";
import { RowOfCollectionCardsForKey } from "./RowOfCollectionCards";
import { ByLevelGroups } from "./ByLevelGroups";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { LanguageGroup } from "./LanguageGroup";

import { BookCardGroup } from "./BookCardGroup";
import { ByLanguageGroups } from "./ByLanguageGroups";
import { ByTopicsGroups } from "./ByTopicsGroups";
import { useTrack } from "../analytics/Analytics";
import { IEmbedSettings } from "../model/ContentInterfaces";
import { useDocumentTitle } from "./Routes";
import { getCollectionAnalyticsInfo } from "../analytics/CollectionAnalyticsInfo";

import { ICollection } from "../model/ContentInterfaces";
import { useCollectionStats } from "../connection/LibraryQueryHooks";

import { Bar, LabelFormatter } from "@nivo/bar";

// Used for formatting dates... because... apparently vanilla JS doesn't support it out of the box?!?!?!
import moment from "moment";
import { commonUI } from "../theme";

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

interface ICollectionStatsResponse {
    //stats: IBookDownload[];
    stats: IDailySessionsInfo[];
    devices: number;
    languages: number;
}

// reinstate in place of getFakeCollectionStats once past initial
function getEmptyCollectionStats(): ICollectionStatsResponse {
    return { stats: [], devices: 0, languages: 0 };
}

// Temporary for testing
function getFakeCollectionStats(): ICollectionStatsResponse {
    const fakeResponse = {
        devices: 1072,
        languages: 35,
        stats: [
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
        ],
    };
    return fakeResponse;
}

function useGetCollectionStats(
    collection: ICollection | undefined
): ICollectionStatsResponse {
    // Uncomment to use fake data, in case getting the real data is too slow
    return getFakeCollectionStats();

    // const { response } = useCollectionStats(collection?.filter);
    // if (response && response["data"] && response["data"]["stats"])
    //     return response["data"];
    // return getEmptyCollectionStats();
}

function getWeek(date: moment.Moment) {
    const sunday = date.clone();
    sunday.day(0);
    return sunday.format("YYYY-MM-DD");
}

export const CollectionStatsPage: React.FunctionComponent<{
    collectionName: string;
    embeddedSettings?: IEmbedSettings;
}> = (props) => {
    // remains empty (and unused) except in byLanguageGroups mode, when a callback sets it.
    //const [booksAndLanguages, setBooksAndLanguages] = useState("");
    const { collection, loading } = useGetCollection(props.collectionName);
    //const { params, sendIt } = getCollectionAnalyticsInfo(collection);
    useDocumentTitle(collection?.label + " statistics");
    const byMonth = false;

    const responseData = useGetCollectionStats(collection);

    //useTrack("Open Collection", params, sendIt);
    if (
        loading ||
        !responseData ||
        !responseData.stats ||
        responseData.stats.length === 0
    ) {
        return null;
    }

    if (!collection) {
        return <div>Collection not found</div>;
    }

    const counts = new Map<string, number>();
    const infoList = responseData.stats;
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
    const backColor = "#333";
    const graphWidth = 600;
    const gapWidth = "10px";

    return (
        <div
            css={css`
                color: white;
                background-color: black;
                padding: ${gapWidth};
            `}
        >
            Here are the stats for {collection.urlKey} with filter{" "}
            {JSON.stringify(collection.filter)}
            <div
                css={css`
                    display: flex;
                `}
            >
                <div
                    css={css`
                        color: ${commonUI.colors.bloomRed};
                        background-color: ${backColor};
                        margin-right: ${gapWidth};
                        padding: 10px;
                    `}
                >
                    <div
                        css={css`
                            padding-top: 5px;
                            display: flex;
                            justify-content: space-around;
                        `}
                    >
                        Devices
                    </div>
                    <div
                        css={css`
                            display: flex;
                            justify-content: space-around;
                            font-size: smaller;
                        `}
                    >
                        with Bloom Reader
                    </div>
                    <div
                        css={css`
                            display: flex;
                            justify-content: space-around;
                            font-size: larger;
                            color: white;
                            margin-top: 15px;
                        `}
                    >
                        {responseData.devices}
                    </div>
                </div>
                <div
                    css={css`
                        color: ${commonUI.colors.bloomRed};
                        background-color: ${backColor};
                        margin-right: ${gapWidth};
                        padding: 10px;
                    `}
                >
                    <div
                        css={css`
                            padding-top: 5px;
                            display: flex;
                            justify-content: space-around;
                        `}
                    >
                        Languages
                    </div>
                    <div
                        css={css`
                            display: flex;
                            justify-content: space-around;
                            font-size: larger;
                            color: white;
                            margin-top: 15px;
                        `}
                    >
                        {responseData.languages}
                    </div>
                </div>
                <div>
                    <div
                        // It would be nice if this was part of the chart, so it's included in any svg we
                        // make for it...but so far I can't find any way to do so.
                        css={css`
                            color: ${commonUI.colors.bloomRed};
                            background-color: ${backColor};
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
                            background: backColor,
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
                        margin={{ top: 10, right: 20, bottom: 70, left: 40 }}
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
            </div>
            {/* <p> mapData={JSON.stringify(mapData)}</p> */}
            {/* <p>
                rawResponse=
                {JSON.stringify(responseData)}
            </p> */}
        </div>
    );
};

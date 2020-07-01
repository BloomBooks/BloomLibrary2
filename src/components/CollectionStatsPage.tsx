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

import { Bar } from "@nivo/bar";

// Used for formatting dates... because... apparently vanilla JS doesn't support it out of the box?!?!?!
const moment = require("moment");

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
}

function getEmptyCollectionStats(): ICollectionStatsResponse {
    return { stats: [] };
}

function getFakeCollectionStats(): ICollectionStatsResponse {
    const fakeResponse = JSON.parse(
        '{"stats":[{"datelocal":"2020-06-18T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":6},{"datelocal":"2020-06-19T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":12},{"datelocal":"2020-06-22T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":43},{"datelocal":"2020-06-23T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":96},{"datelocal":"2020-06-23T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"United States","bloomreadersessions":1},{"datelocal":"2020-06-24T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":87},{"datelocal":"2020-06-25T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":158},{"datelocal":"2020-06-26T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":58},{"datelocal":"2020-06-27T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":41},{"datelocal":"2020-06-28T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":113},{"datelocal":"2020-06-28T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Mexico","bloomreadersessions":1},{"datelocal":"2020-06-29T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":127},{"datelocal":"2020-06-30T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Colombia","bloomreadersessions":3},{"datelocal":"2020-06-30T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"Guatemala","bloomreadersessions":97},{"datelocal":"2020-06-30T00:00:00.000Z","bookbranding":"Juarez-Guatemala","country":"United States","bloomreadersessions":11}]}'
    );
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

function getBookDownloadData(responseData: any) {
    const counts = new Map<string, number>();
    const bookdownloads = responseData.stats;

    bookdownloads.forEach((bookdownload: any) => {
        const count = counts.get(bookdownload.bookid) || 0;
        counts.set(bookdownload.bookid, count + 1);
    });

    const mapData = Array.from(counts.keys()).map((x) => {
        return { id: x, value: counts.get(x) };
    });

    return mapData;
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

    infoList.forEach((dailyInfo) => {
        // TODO: Parse date???
        const date = new moment(dailyInfo.datelocal);
        const formattedDate = date.format("YYYY-MM-DD");

        const count = counts.get(formattedDate) || 0;
        counts.set(formattedDate, count + dailyInfo.bloomreadersessions);
    });

    const mapData = Array.from(counts.keys()).map((x) => {
        return { date: x, sessionCount: counts.get(x) };
    });

    return (
        <div>
            Here are the stats for {collection.urlKey} with filter{" "}
            {JSON.stringify(collection.filter)}
            <Bar
                data={mapData}
                keys={["sessionCount"]}
                indexBy="date"
                groupMode={"stacked"}
                layout={"vertical"}
                height={400}
                width={600}
                // height/width need to include enough space for margin too
                margin={{ top: 50, right: 50, bottom: 80, left: 60 }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: "Date",
                    legendPosition: "middle",
                    legendOffset: 60,
                }}
            ></Bar>
            <p> mapData={JSON.stringify(mapData)}</p>
            <p>
                rawResponse=
                {JSON.stringify(responseData)}
            </p>
        </div>
    );
};

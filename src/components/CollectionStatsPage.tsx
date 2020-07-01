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

interface IBookDownload {
    bookid: string;
    timeofshelldownload: string;
}

interface ICollectionStatsResponse {
    // TODO: Update me when the final schema is ready.
    //length: number;
    stats: IBookDownload[];
}

function getEmptyCollectionStats(): ICollectionStatsResponse {
    return { stats: [] };
}

// TODO: Change the return type
function useGetCollectionStats(
    collection: ICollection | undefined
): ICollectionStatsResponse {
    const { response } = useCollectionStats(collection?.filter);
    if (response && response["data"] && response["data"]["stats"])
        return response["data"];
    return getEmptyCollectionStats();
    //return [];
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
    const bookdownloads: IBookDownload[] = responseData.stats;

    bookdownloads.forEach((bookdownload) => {
        const count = counts.get(bookdownload.bookid) || 0;
        counts.set(bookdownload.bookid, count + 1);
    });

    const mapData = Array.from(counts.keys()).map((x) => {
        return { id: x, value: counts.get(x) };
    });

    // const myBar = ({ data }) => (
    //     <Bar data={data} keys={["downloadCount"]} indexBy="bookId" />
    // );
    // [{  id,  value  }];;
    return (
        <div>
            Here are the stats for {collection.urlKey} with filter{" "}
            {JSON.stringify(collection.filter)}
            {JSON.stringify(mapData)}
            <Bar
                data={mapData}
                groupMode={"stacked"}
                layout={"vertical"}
                height={200}
                width={200}
            ></Bar>
        </div>
    );
};

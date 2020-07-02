// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";

import { useGetCollection } from "../../model/Collections";

import { IEmbedSettings } from "../../model/ContentInterfaces";
import { useDocumentTitle } from "../Routes";

import { ICollection } from "../../model/ContentInterfaces";
import { useCollectionStats } from "../../connection/LibraryQueryHooks";

// Used for formatting dates... because... apparently vanilla JS doesn't support it out of the box?!?!?!
import moment from "moment";
import { commonUI } from "../../theme";
import { ReaderSessionsChart } from "./ReaderSessionsChart";
import {
    IComprehensionQuestionData,
    ComprehensionQuestionsReport,
} from "./ComprehensionQuestionsReport";
import { IScreenProps, RegisterScreen } from "./CollectionStatsPage";

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

export interface ICollectionStatsResponse {
    //stats: IBookDownload[];
    stats: IDailySessionsInfo[];
    devices: number;
    languages: number;
    comprehensionData: IComprehensionQuestionData[];
}

// reinstate in place of getFakeCollectionStats once past initial
function getEmptyCollectionStats(): ICollectionStatsResponse {
    return { stats: [], devices: 0, languages: 0, comprehensionData: [] };
}

// Temporary for testing
function getFakeCollectionStats(): ICollectionStatsResponse {
    const fakeResponse = {
        devices: 1072,
        languages: 35,
        comprehensionData: [
            {
                title: "(3-6a) The Good Brothers",
                branding: "PNG-RISE",
                questions: 3,
                quizzesTaken: 222,
                meanCorrect: 69,
                medianCorrect: 50,
            },
        ],
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

export const DataStudioDashboardScreen: React.FunctionComponent<IScreenProps> = (
    props
) => {
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

    const backColor = "#333";
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
                    margin-bottom: ${gapWidth};
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
                <ReaderSessionsChart
                    responseData={responseData}
                    backColor={backColor}
                />
            </div>
            <ComprehensionQuestionsReport
                cqData={responseData.comprehensionData}
                backColor={backColor}
            />
            {/* <p> mapData={JSON.stringify(mapData)}</p> */}
            {/* <p>
                rawResponse=
                {JSON.stringify(responseData)}
            </p> */}
        </div>
    );
};

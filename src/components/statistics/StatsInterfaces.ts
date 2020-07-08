// These are the properties that the main screen sends down to filter what we show.

import { IDateRange } from "./DateRangePicker";
import { ICollection } from "../../model/ContentInterfaces";

// In the future individual charts might have further settings, but it seems like then they should define new interfaces?
export interface IStatsProps {
    collection: ICollection;
    dateRange: IDateRange;
    registerExportDataFn: (fn: ExportDataFn | undefined) => void;
}

export interface IOverviewStats {
    books: number;
    languages: number;
    topics: number;

    bloomPubDeviceMobile: number;
    bloomPubDevicePC: number;

    downloadsEpub: number;
    downloadsBloomPub: number;
    downloadsPDF: number;
    downloadsShellbooks: number;

    readsWeb: number;
    readsApps: number;
    readsBloomReader: number;
}

// These are query results in which each row represents one day.
// The exact names here need to match what we are getting from the azure function.
export interface IDailyBookStat {
    dateEventLocal: string;
    branding: string;
    country: string;
    bloomReaderSessions: number;
}

// These are query results in which each row has info on a single book. The info is still about what happened during a date range.
// The exact names here need to match what we are getting from the azure function.
export interface IBookStat {
    title: string;
    branding: string;
    questions: number;
    quizzesTaken: number;
    meanCorrect: number;
    medianCorrect: number;

    language: string;
    /* to add
    features: string;
    */
    startedCount: number;
    finishedCount: number;
}

export type ExportDataFn = () => string[][];

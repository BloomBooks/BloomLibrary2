// These are the properties that the main screen sends down to filter what we show.

import { IDateRange } from "./DateRangePicker";
import { ICollection } from "../../model/ContentInterfaces";
import { ExportDataFn } from "../../export/exportData";

export interface IScreenOption {
    label: string;
    value: any;
}

// In the future individual charts might have further settings, but it seems like then they should define new interfaces?
export interface IStatsProps {
    collection: ICollection;
    dateRange: IDateRange;
    options: IScreenOption[];
    registerExportDataFn: (
        // undefined if we can't currently export data,
        // either because we haven't gotten it yet, or because
        // the query found nothing.
        fn: ExportDataFn | undefined,
        waiting: boolean // true if we are waiting for results.
    ) => void;
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

    shellDownloads: number;
    pdfDownloads: number;
    epubDownloads: number;
    bloomPubDownloads: number;
}

export function getDefaultBookStat(): IBookStat {
    return {
        title: "",
        branding: "",
        questions: 0,
        quizzesTaken: 0,
        meanCorrect: 0,
        medianCorrect: 0,
        language: "",
        startedCount: 0,
        finishedCount: 0,
        shellDownloads: 0,
        pdfDownloads: 0,
        epubDownloads: 0,
        bloomPubDownloads: 0,
    };
}

export interface IScreen {
    label: string;
    component: React.FunctionComponent<IStatsProps>;
    options?: IScreenOption[];
}

export const kStatsPageGray = "#ececec";

// Analytics service interface for statistics and reporting
import type { IFilter } from "FilterTypes";
import type { IStatisticsQuerySpec } from "../../IStatisticsQuerySpec";

export interface BookStatsModel {
    title: string;
    branding: string;
    questions: number;
    quizzesTaken: number;
    meanCorrect: number;
    medianCorrect: number;
    language: string;
    languageName?: string;
    startedCount: number;
    finishedCount: number;
    shellDownloads: number;
    pdfDownloads: number;
    epubDownloads: number;
    bloomPubDownloads: number;
}

export interface StatsQuery {
    dateRange?: {
        startDate?: Date;
        endDate?: Date;
    };
    collectionFilter?: IFilter;
    statisticsQuerySpec?: IStatisticsQuerySpec;
}

export interface IAnalyticsService {
    // Book statistics
    getBookStats(query: StatsQuery): Promise<BookStatsModel[]>;
    getCollectionStats(query: StatsQuery): Promise<BookStatsModel[]>;

    // Individual book analytics
    joinBooksAndStats<T extends { objectId?: string; bookInstanceId?: string }>(
        books: T[],
        bookStats: BookStatsModel[]
    ): void;
    extractBookStatFromRawData(
        statRow: Record<string, unknown>
    ): BookStatsModel;

    // Reading analytics
    getReadingStats(
        bookIds: string[],
        dateRange?: { startDate?: Date; endDate?: Date }
    ): Promise<BookStatsModel[]>;
}

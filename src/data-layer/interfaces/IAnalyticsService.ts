// Analytics service interface for statistics and reporting
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
    collectionFilter?: any; // Will type properly later
    statisticsQuerySpec?: any;
}

export interface IAnalyticsService {
    // Book statistics
    getBookStats(query: StatsQuery): Promise<any>;
    getCollectionStats(query: StatsQuery): Promise<any>;

    // Individual book analytics
    joinBooksAndStats(books: any[], bookStats: any): void;
    extractBookStatFromRawData(statRow: any): BookStatsModel;

    // Reading analytics
    getReadingStats(
        bookIds: string[],
        dateRange?: { startDate?: Date; endDate?: Date }
    ): Promise<any>;
}

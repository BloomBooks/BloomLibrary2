// These are the properties that the main screen sends down to filter what we show.
// In the future individual charts might have further settings, but it seems like then they should define new interfaces?
export interface IStatsProps {
    collectionName: string;
    start: Date;
    end: Date;
}

// These are query results in which each row represents one day.
// The exact names here need to match what we are getting from the azure function.
export interface IDailyBookStat {
    dateUTC: string;
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

    /* to add
    language: string;
    features: string;
    startedCount: number;
    finishedCount: number;
    */
}

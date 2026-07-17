// Stub Supabase implementation of IAnalyticsService. Analytics/statistics
// are out of scope for this migration step. Query methods resolve to empty
// results (rather than throwing) since stats UI can mount for anonymous
// visitors and should just show "no data" instead of crashing; the pure
// helper methods do the minimal sane thing.
import {
    IAnalyticsService,
    BookStatsModel,
} from "../../interfaces/IAnalyticsService";

function emptyBookStat(): BookStatsModel {
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

export class SupabaseAnalyticsService implements IAnalyticsService {
    async getBookStats(): Promise<BookStatsModel[]> {
        return [];
    }

    async getCollectionStats(): Promise<BookStatsModel[]> {
        return [];
    }

    joinBooksAndStats<
        T extends { objectId?: string; bookInstanceId?: string }
    >(): void {
        // No stats available in this data layer yet; nothing to join.
    }

    extractBookStatFromRawData(): BookStatsModel {
        return emptyBookStat();
    }

    async getReadingStats(): Promise<BookStatsModel[]> {
        return [];
    }
}

import { useMemo } from "react";
import { IStatsPageProps, IBookStat } from "./StatsInterfaces";
import {
    useCollectionStats,
    extractBookStatFromRawData,
    IBasicBookInfo,
    useSearchBooks,
} from "../../connection/LibraryQueryHooks";
import { getFilterForCollectionAndChildren } from "../../model/Collections";
import { BookOrderingScheme } from "../../model/ContentInterfaces";

// Prefer the first Parse language pointer as a lightweight fallback language tag.
function getLanguageTagFromBook(book: IBasicBookInfo): string | undefined {
    return book.languages?.[0]?.isoCode;
}

// Build a bookInstanceId-to-language map, keeping the first tag we see for duplicate ids.
// This is intentionally only graceful: if bookInstanceId is duplicated, any one matching
// language tag is good enough for repairing missing stats rows.
function buildLanguageMap(books: IBasicBookInfo[]): Map<string, string> {
    const result = new Map<string, string>();

    books.forEach((book) => {
        if (!book.bookInstanceId) {
            return;
        }

        const languageTag = getLanguageTagFromBook(book);
        if (!languageTag) {
            return;
        }

        if (!result.has(book.bookInstanceId)) {
            result.set(book.bookInstanceId, languageTag);
        }
    });

    return result;
}

// Fill missing stats languages from Parse book language pointers.
function useRawBookStatsWithParseLanguageFallback(
    props: IStatsPageProps,
    urlSuffix: string
): IBookStat[] | undefined {
    const { response } = useCollectionStats(props, urlSuffix);
    const collectionFilter = props.collection.filter
        ? props.collection.filter
        : getFilterForCollectionAndChildren(props.collection);

    // The stats API sometimes returns rows without a language tag
    // (specifically when we only have download info, not read info),
    // so we query matching books and repair missing stats.language from langPointers.
    // See BL-16000.
    const { books: parseBooks } = useSearchBooks(
        {
            include: "langPointers",
            keys: "bookInstanceId,langPointers",
            limit: 10000000,
        },
        collectionFilter || {},
        BookOrderingScheme.None,
        undefined,
        !collectionFilter
    );

    const parseLanguageByInstanceId = useMemo(() => {
        return buildLanguageMap(parseBooks);
    }, [parseBooks]);

    return useMemo(() => {
        if (response && response["data"] && response["data"]["stats"]) {
            return response["data"]["stats"].map((s: any) => {
                const stats = extractBookStatFromRawData(s);
                if (stats.language) {
                    return stats;
                } else {
                    const fallbackLanguage = parseLanguageByInstanceId.get(
                        s.bookinstanceid
                    );

                    return fallbackLanguage
                        ? { ...stats, language: fallbackLanguage }
                        : stats;
                }
            });
        } else {
            return undefined;
        }
    }, [response, parseLanguageByInstanceId]);
}

// Apply an optional client-side filter to repaired per-book stats.
function useFilteredBookStats(
    props: IStatsPageProps,
    urlSuffix: string,
    predicate?: (bookStatInfo: IBookStat) => boolean
): IBookStat[] | undefined {
    const stats = useRawBookStatsWithParseLanguageFallback(props, urlSuffix);

    return useMemo(() => {
        return predicate ? stats?.filter(predicate) : stats;
    }, [predicate, stats]);
}

export function useGetBookStats(
    props: IStatsPageProps
): IBookStat[] | undefined {
    return useFilteredBookStats(props, "reading/per-book");
}

const comprehensionStatsPredicate = (bookStatInfo: IBookStat) =>
    bookStatInfo.quizzesTaken > 0 && bookStatInfo.questions > 0;
export function useGetBookComprehensionEventStats(
    props: IStatsPageProps
): IBookStat[] | undefined {
    return useFilteredBookStats(
        props,
        "reading/per-book",
        comprehensionStatsPredicate
    );
}

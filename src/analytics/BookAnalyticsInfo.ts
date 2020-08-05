import { Book } from "../model/Book";
import { splitPathname } from "../components/Routes";

export interface IBookAnalyticsInfo {
    book?: string;
    bookTitle?: string;
    publisher?: string;
    topic?: string;
    level?: string;
    language?: string;
    // epub, shell, bloomd, read; mostly forms of book that can be downloaded,
    // but can be undefined (used in Book Detail) and 'read' (for player page).
    eventType?: string;
    source?: string;
    bookInstanceId?: string;
    brandingProjectName?: string;
}

// Get the analytics information we'd like to send to segment.io for
// various book-related events.
export function getBookAnalyticsInfo(
    book: Book | null | undefined,
    lang: string | undefined,
    eventType: string | undefined,
    prefixes?: string
): IBookAnalyticsInfo {
    const topicTag = (book?.tags || []).find((x) => x.startsWith("topic:"));
    const topic = topicTag ? topicTag.substring("topic:".length) : "";
    let level = book?.level;
    if (!level) {
        const computedLevelTag = (book?.tags || []).find((x) =>
            x.startsWith("computedLevel:")
        );
        if (computedLevelTag) {
            level = computedLevelTag.substring("computedLevel:".length);
        }
    }
    const result: IBookAnalyticsInfo = {
        book: book?.id,
        bookTitle: book?.title,
        publisher: book?.publisher,
        topic,
        level,
        bookInstanceId: book?.bookInstanceId,
    };
    if (lang) {
        result.language = lang;
    }
    if (eventType) {
        result.eventType = eventType;
    }
    if (prefixes) {
        // The idea here is that our spec calls for the pathname
        // not to include breadcrumbs, that is, it should just indicate
        // the collection, including any filters.
        // The split extracts the collectionName, and then we re-attach the filters.
        // However, currently, I believe book detail is never invoked
        // with a url including either breadcrumbs or filters, just {/collection urlkey}/book/id.
        // So we'd get the same result (but be less future-proof)
        // by ust setting result.source to filters.
        const { collectionName, filters } = splitPathname(prefixes);
        const pathParts = filters.map((x) => ":" + x);
        pathParts.splice(0, 0, collectionName);
        result.source = pathParts.join("/");
    }
    if (book?.brandingProjectName) {
        result.brandingProjectName = book.brandingProjectName;
    }
    return result;
}

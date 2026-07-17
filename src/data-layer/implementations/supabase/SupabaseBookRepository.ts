// Supabase implementation of the Book repository (read-path only; the
// anonymous-browsing scope for this migration step). Write operations
// (updateBook, deleteBook, saveArtifactVisibility) are out of scope and
// throw, same as they would need real auth wiring to be safe.
import {
    BasicBookInfoRecord,
    IBookRepository,
} from "../../interfaces/IBookRepository";
import { LanguageModel } from "../../models/LanguageModel";
import { IFilter } from "FilterTypes";
import {
    BookSearchQuery,
    BookGridQuery,
    BookSearchResult,
    BookGridResult,
} from "../../types/QueryTypes";
import { BookOrderingScheme } from "../../types/CommonTypes";
import { SupabaseConnection } from "./SupabaseConnection";
import { Book, createBookFromParseServerData } from "../../../model/Book";
import {
    supabaseRowToParseShape,
    SupabaseBookRow,
    SupabaseLanguageRow,
    SupabaseUserRow,
} from "./SupabaseBookMapper";
import { applyBookFilter, applyOrdering } from "./SupabaseBookQueryBuilder";

// Aliased so they don't collide with the (always-null, unused) raw
// `languages` column that also exists on `books` -- see SupabaseBookMapper.ts
// for details on why a distinct alias is used instead of Parse's literal
// `languages:languages(*)` naming.
const BOOK_SELECT_WITH_EMBEDS =
    "*, embeddedLanguages:languages(id,iso_code,name,english_name,usage_count,banner_image_url), embeddedUser:users(id,email)";

const BASIC_BOOK_INFO_SELECT =
    "id,title,base_url,tags,features,last_uploaded,harvest_state,harvest_started_at,page_count,phash_of_first_content_image,book_hash_from_images,all_titles,edition,draft,rebrand,in_circulation,show," +
    "embeddedLanguages:languages(id,iso_code,name,english_name,usage_count,banner_image_url)";

interface BookRowWithEmbeds extends SupabaseBookRow {
    in_circulation?: boolean | null;
    embeddedLanguages?: SupabaseLanguageRow[] | null;
    embeddedUser?: SupabaseUserRow | null;
}

function toParseDate(
    value: string | null | undefined
): { iso: string } | undefined {
    return value ? { iso: new Date(value).toISOString() } : undefined;
}

export class SupabaseBookRepository implements IBookRepository {
    async getBook(id: string): Promise<Book | null> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("books")
                .select(BOOK_SELECT_WITH_EMBEDS)
                .eq("id", id)
                .maybeSingle();

            if (error) {
                console.error("Error getting book by id:", error);
                return null;
            }
            if (!data) {
                return null;
            }
            return this.rowToBook(data as BookRowWithEmbeds);
        } catch (error) {
            console.error("Error getting book by id:", error);
            return null;
        }
    }

    async getBooks(ids: string[]): Promise<Book[]> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("books")
                .select(BOOK_SELECT_WITH_EMBEDS)
                .in("id", ids);

            if (error) {
                console.error("Error getting books:", error);
                return [];
            }
            return (data ?? []).map((row: BookRowWithEmbeds) =>
                this.rowToBook(row)
            );
        } catch (error) {
            console.error("Error getting books:", error);
            return [];
        }
    }

    async searchBooks(query: BookSearchQuery): Promise<BookSearchResult> {
        const client = SupabaseConnection.getClient();
        const limit = query.pagination?.limit || 50;
        const skip = query.pagination?.skip || 0;

        try {
            const initial = client
                .from("books")
                .select(BOOK_SELECT_WITH_EMBEDS, { count: "exact" });
            const filtered = await applyBookFilter(
                client,
                initial,
                query.filter
            );
            let q = filtered.query;

            const ordering = applyOrdering(q, query.orderingScheme);
            q = ordering.query;

            if (!ordering.isClientSideOrdered) {
                q = q.range(skip, skip + limit - 1);
            }
            // else: title-based ordering schemes fetch (up to PostgREST's row
            // cap) all matches, same as Parse's Number.MAX_SAFE_INTEGER hack;
            // sorting/pagination happens client-side via
            // doExpensiveClientSideSortingIfNeeded(), unchanged by this migration.

            const { data, error, count } = await q;
            if (error) {
                throw error;
            }

            const books = (data ?? []).map((row: BookRowWithEmbeds) =>
                this.rowToBook(row)
            );

            return {
                books,
                totalMatchingRecords: count ?? books.length,
                errorString: null,
                waiting: false,
                items: books,
                totalCount: count ?? books.length,
                hasMore: books.length === limit,
            };
        } catch (error) {
            console.error("Error searching books:", error);
            return {
                books: [],
                totalMatchingRecords: 0,
                errorString:
                    error instanceof Error ? error.message : "Unknown error",
                waiting: false,
                items: [],
                totalCount: 0,
                hasMore: false,
            };
        }
    }

    async updateBook(): Promise<void> {
        throw new Error("not implemented in Supabase data layer yet");
    }

    async deleteBook(): Promise<void> {
        throw new Error("not implemented in Supabase data layer yet");
    }

    async getBooksForGrid(query: BookGridQuery): Promise<BookGridResult> {
        const result = await this.searchBooks({
            filter: query.filter,
            pagination: query.pagination,
            orderingScheme: BookOrderingScheme.Default,
        });

        return {
            onePageOfMatchingBooks: result.books,
            totalMatchingBooksCount: result.totalMatchingRecords,
        };
    }

    async getBookCount(filter: IFilter): Promise<number> {
        const client = SupabaseConnection.getClient();
        try {
            const initial = client
                .from("books")
                .select("id", { count: "exact", head: true });
            const { query: q } = await applyBookFilter(client, initial, filter);

            const { count, error } = await q;
            if (error) {
                throw error;
            }
            return count ?? 0;
        } catch (error) {
            console.error("Error getting book count:", error);
            throw error;
        }
    }

    async getRelatedBooks(bookId: string): Promise<Book[]> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("related_books")
                .select("book_ids")
                .contains("book_ids", [bookId]);

            if (error) {
                console.error("Error getting related books:", error);
                return [];
            }

            const otherIds = Array.from(
                new Set(
                    (data ?? [])
                        .flatMap(
                            (row: { book_ids: string[] | null }) =>
                                row.book_ids ?? []
                        )
                        .filter((id: string) => id !== bookId)
                )
            );
            if (otherIds.length === 0) {
                return [];
            }

            const { data: bookRows, error: bookError } = await client
                .from("books")
                .select(BOOK_SELECT_WITH_EMBEDS)
                .in("id", otherIds);

            if (bookError) {
                console.error("Error fetching related book rows:", bookError);
                return [];
            }

            return (bookRows ?? [])
                .filter(
                    (row: BookRowWithEmbeds) => row.in_circulation !== false
                )
                .map((row: BookRowWithEmbeds) => this.rowToBook(row));
        } catch (error) {
            console.error("Error getting related books:", error);
            return [];
        }
    }

    async getBookDetail(id: string): Promise<Book | null> {
        return this.getBook(id);
    }

    async saveArtifactVisibility(): Promise<void> {
        throw new Error("not implemented in Supabase data layer yet");
    }

    async getBasicBookInfos(ids: string[]): Promise<BasicBookInfoRecord[]> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("books")
                .select(BASIC_BOOK_INFO_SELECT)
                .in("id", ids);

            if (error) {
                console.error("Error getting basic book infos:", error);
                return [];
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (data ?? []).map((row: any) => this.rowToBasicBookInfo(row));
        } catch (error) {
            console.error("Error getting basic book infos:", error);
            return [];
        }
    }

    async getCurrentBookData(bookId: string): Promise<Book | null> {
        return this.getBook(bookId);
    }

    private rowToBook(row: BookRowWithEmbeds): Book {
        const pojo = supabaseRowToParseShape(
            row,
            row.embeddedLanguages,
            row.embeddedUser
        );
        return createBookFromParseServerData(pojo);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private rowToBasicBookInfo(row: any): BasicBookInfoRecord {
        const languages: LanguageModel[] = (row.embeddedLanguages ?? []).map(
            (lang: SupabaseLanguageRow) =>
                new LanguageModel({
                    objectId: lang.id,
                    isoCode: lang.iso_code ?? "",
                    name: lang.name ?? "",
                    englishName: lang.english_name ?? undefined,
                    usageCount: lang.usage_count ?? 0,
                    bannerImageUrl: lang.banner_image_url ?? undefined,
                })
        );

        return {
            objectId: row.id,
            title: row.title ?? "",
            baseUrl: row.base_url ?? "",
            langPointers: languages.length > 0 ? languages : undefined,
            languages: languages.length > 0 ? languages : undefined,
            tags: row.tags ?? undefined,
            features: row.features ?? undefined,
            lastUploaded: toParseDate(row.last_uploaded),
            harvestState: row.harvest_state ?? undefined,
            harvestStartedAt: toParseDate(row.harvest_started_at),
            pageCount: row.page_count ?? undefined,
            phashOfFirstContentImage:
                row.phash_of_first_content_image ?? undefined,
            bookHashFromImages: row.book_hash_from_images ?? undefined,
            allTitles: row.all_titles ?? undefined,
            edition: row.edition ?? undefined,
            draft: row.draft ?? undefined,
            rebrand: row.rebrand ?? undefined,
            inCirculation: row.in_circulation ?? undefined,
            show: row.show ?? undefined,
        };
    }
}

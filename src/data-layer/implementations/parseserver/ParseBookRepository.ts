// ParseServer implementation of Book repository
import axios from "axios";
import {
    BasicBookInfoRecord,
    IBookRepository,
} from "../../interfaces/IBookRepository";
import { BookModel } from "../../models/BookModel";
import { LanguageModel } from "../../models/LanguageModel";
import { IFilter } from "FilterTypes";
import type { ParseDate } from "../../types/CommonTypes";
import {
    BookSearchQuery,
    BookGridQuery,
    BookSearchResult,
    BookGridResult,
} from "../../types/QueryTypes";
import { BooleanOptions, BookOrderingScheme } from "../../types/CommonTypes";
import { ParseConnection } from "./ParseConnection";
import { Book, createBookFromParseServerData } from "../../../model/Book";
import { constructParseBookQuery } from "../../../connection/BookQueryBuilder";
import { ArtifactVisibilitySettingsGroup } from "../../../model/ArtifactVisibilitySettings";

type ParseBookRecord = {
    objectId: string;
    [key: string]: unknown;
};

type ParseBookResponse = {
    results: ParseBookRecord[];
    count?: number;
};

// Basic CRUD operations
export class ParseBookRepository implements IBookRepository {
    // Basic CRUD operations
    async getBook(id: string): Promise<Book | null> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get<ParseBookResponse>(
                `${connection.url}classes/books`,
                {
                    headers: connection.headers,
                    params: {
                        where: JSON.stringify({ objectId: id }),
                        keys: this.getBookDetailFields(),
                        include: "uploader,langPointers",
                    },
                }
            );

            if (response.data.results.length === 0) {
                return null;
            }

            const bookData = response.data.results[0];
            return this.convertParseDataToBookModel(bookData);
        } catch (error) {
            console.error("Error getting book by ID:", error);
            return null;
        }
    }

    async getBooks(ids: string[]): Promise<Book[]> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get<ParseBookResponse>(
                `${connection.url}classes/books`,
                {
                    headers: connection.headers,
                    params: {
                        where: JSON.stringify({ objectId: { $in: ids } }),
                        keys: this.getGridBookKeys(),
                        include: "uploader,langPointers",
                    },
                }
            );

            return response.data.results.map((bookData) =>
                this.convertParseDataToBookModel(bookData)
            );
        } catch (error) {
            console.error("Error getting books:", error);
            return [];
        }
    }

    async searchBooks(query: BookSearchQuery): Promise<BookSearchResult> {
        const connection = ParseConnection.getConnection();

        try {
            const queryParams = constructParseBookQuery(
                {
                    keys: this.getGridBookKeys(),
                    include: "uploader,langPointers",
                    limit: query.pagination?.limit || 50,
                    skip: query.pagination?.skip || 0,
                    count: 1, // Request total count from Parse Server
                },
                query.filter,
                [], // tags - would need to be passed in
                query.orderingScheme || BookOrderingScheme.Default
            );

            // Convert where clause to JSON string for GET request
            const params: Record<string, unknown> = { ...queryParams };
            if (params.where) {
                params.where = JSON.stringify(params.where);
            }

            const response = await axios.get<ParseBookResponse>(
                `${connection.url}classes/books`,
                {
                    headers: connection.headers,
                    params,
                }
            );

            const books = response.data.results.map((bookData) =>
                this.convertParseDataToBookModel(bookData)
            );

            return {
                books: books,
                totalMatchingRecords: response.data.count || books.length,
                errorString: null,
                waiting: false,
                items: books,
                totalCount: response.data.count || books.length,
                hasMore: books.length === (query.pagination?.limit || 50),
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

    async updateBook(id: string, updates: Partial<BookModel>): Promise<void> {
        const connection = ParseConnection.getConnection();

        try {
            const params = this.convertBookModelToParseData(updates);
            // Mark as library user control to prevent unwanted changes
            Object.assign(params, { updateSource: "libraryUserControl" });

            await axios.put(`${connection.url}classes/books/${id}`, params, {
                headers: connection.headers,
            });
        } catch (error) {
            console.error("Error updating book:", error);
            throw error;
        }
    }

    async deleteBook(id: string): Promise<void> {
        const connection = ParseConnection.getConnection();

        try {
            await axios.delete(`${connection.url}classes/books/${id}`, {
                headers: connection.headers,
            });
        } catch (error) {
            console.error("Error deleting book:", error);
            throw error;
        }
    }

    // Complex queries
    async getBooksForGrid(query: BookGridQuery): Promise<BookGridResult> {
        const books = await this.searchBooks({
            filter: query.filter,
            pagination: query.pagination,
            orderingScheme: BookOrderingScheme.Default,
        });

        return {
            onePageOfMatchingBooks: books.books,
            totalMatchingBooksCount:
                books.totalMatchingRecords || books.totalCount || 0,
        };
    }

    async getBookCount(filter: IFilter): Promise<number> {
        const connection = ParseConnection.getConnection();

        try {
            const queryParams = constructParseBookQuery(
                { limit: 0, count: 1 },
                filter,
                [], // tags - would need to be passed in
                BookOrderingScheme.None
            );

            // Convert where clause to JSON string for GET request
            const params: Record<string, unknown> = { ...queryParams };
            if (params.where) {
                params.where = JSON.stringify(params.where);
            }

            const response = await axios.get<ParseBookResponse>(
                `${connection.url}classes/books`,
                {
                    headers: connection.headers,
                    params,
                }
            );

            const count =
                typeof response.data.count === "number"
                    ? response.data.count
                    : 0;
            return count;
        } catch (error) {
            console.error("Error getting book count:", error);
            throw error;
        }
    }

    async getRelatedBooks(bookId: string): Promise<Book[]> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(
                `${connection.url}classes/relatedBooks`,
                {
                    headers: connection.headers,
                    params: {
                        where: {
                            books: {
                                __type: "Pointer",
                                className: "books",
                                objectId: bookId,
                            },
                        },
                        include: "books.title,books.inCirculation",
                    },
                }
            );

            if (!response.data.results || response.data.results.length === 0) {
                return [];
            }

            const firstResult = response.data.results[0];
            const books = Array.isArray(firstResult?.books)
                ? firstResult.books
                : [];

            return books
                .filter((record: unknown): record is ParseBookRecord => {
                    if (!isParseBookRecord(record)) {
                        return false;
                    }
                    return (
                        record.objectId !== bookId &&
                        record.inCirculation !== false
                    );
                })
                .map((bookData: ParseBookRecord) =>
                    this.convertParseDataToBookModel(bookData)
                );
        } catch (error) {
            console.error("Error getting related books:", error);
            return [];
        }
    }

    // Specialized operations
    async getBookDetail(id: string): Promise<Book | null> {
        return this.getBook(id);
    }

    async saveArtifactVisibility(
        id: string,
        settings: ArtifactVisibilitySettingsGroup
    ): Promise<void> {
        await this.updateBook(id, settings as Partial<BookModel>);
    }

    // Additional operations found in current codebase
    async getBasicBookInfos(ids: string[]): Promise<BasicBookInfoRecord[]> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get<ParseBookResponse>(
                `${connection.url}classes/books`,
                {
                    headers: connection.headers,
                    params: {
                        where: JSON.stringify({ objectId: { $in: ids } }),
                        keys:
                            "title,baseUrl,objectId,langPointers,tags,features,lastUploaded,harvestState,harvestStartedAt,pageCount,phashOfFirstContentImage,bookHashFromImages,allTitles,edition,draft,rebrand,inCirculation,show",
                        include: "langPointers",
                    },
                }
            );

            return response.data.results.map((rawInfo) =>
                this.convertToBasicBookInfo(rawInfo)
            );
        } catch (error) {
            console.error("Error getting basic book infos:", error);
            return [];
        }
    }

    async getCurrentBookData(bookId: string): Promise<Book | null> {
        const book = await this.getBook(bookId);
        return book;
    }

    // Helper methods for data conversion
    private convertParseDataToBookModel(data: ParseBookRecord): Book {
        try {
            // Create a Book object using existing logic
            // The UI components expect Book instances with methods like getBestLevel()
            const book = createBookFromParseServerData(data);

            return book;
        } catch (error) {
            console.error("Error in convertParseDataToBookModel:", error);
            console.error("Input data was:", data);
            throw error;
        }
    }

    private convertBookModelToParseData(
        book: Partial<BookModel>
    ): Record<string, unknown> {
        const data: Record<string, unknown> = {};

        if (book.title !== undefined) data.title = book.title;
        if (book.allTitles !== undefined) {
            if (book.allTitles instanceof Map) {
                data.allTitles = JSON.stringify(
                    Object.fromEntries(book.allTitles)
                );
            } else if (typeof book.allTitles === "string") {
                data.allTitles = book.allTitles;
            } else {
                data.allTitles = JSON.stringify(book.allTitles ?? {});
            }
        }
        if (book.baseUrl !== undefined) data.baseUrl = book.baseUrl;
        if (book.license !== undefined) data.license = book.license;
        if (book.copyright !== undefined) data.copyright = book.copyright;
        if (book.tags !== undefined) data.tags = book.tags.join(",");
        if (book.summary !== undefined) data.summary = book.summary;
        if (book.pageCount !== undefined)
            data.pageCount = book.pageCount.toString();
        if (book.features !== undefined) data.features = book.features;
        if (book.inCirculation !== undefined)
            data.inCirculation = book.inCirculation;
        if (book.draft !== undefined) data.draft = book.draft;
        if (book.harvestState !== undefined)
            data.harvestState = book.harvestState;
        if (book.downloadCount !== undefined)
            data.downloadCount = book.downloadCount;
        if (book.country !== undefined) data.country = book.country;
        if (book.publisher !== undefined) data.publisher = book.publisher;
        if (book.originalPublisher !== undefined)
            data.originalPublisher = book.originalPublisher;
        if (book.bookInstanceId !== undefined)
            data.bookInstanceId = book.bookInstanceId;
        if (book.brandingProjectName !== undefined)
            data.brandingProjectName = book.brandingProjectName;
        if (book.edition !== undefined) data.edition = book.edition;
        if (book.rebrand !== undefined) data.rebrand = book.rebrand;
        if (book.phashOfFirstContentImage !== undefined)
            data.phashOfFirstContentImage = book.phashOfFirstContentImage;
        if (book.bookHashFromImages !== undefined)
            data.bookHashFromImages = book.bookHashFromImages;

        // Handle language pointers - convert from domain model to Parse format
        if (book.languages !== undefined) {
            data.langPointers = book.languages.map((lang: LanguageModel) => ({
                __type: "Pointer",
                className: "language",
                objectId: lang.objectId,
            }));
        }

        // Handle keywords arrays
        if (book.keywords !== undefined) data.keywords = book.keywords;
        if (book.keywordStems !== undefined)
            data.keywordStems = book.keywordStems;
        if (book.librarianNote !== undefined)
            data.librarianNote = book.librarianNote;

        return data;
    }

    private convertToBasicBookInfo(
        record: ParseBookRecord
    ): BasicBookInfoRecord {
        const languagePointers = this.normalizeLanguagePointers(
            record.langPointers
        );
        const show = this.normalizeShow(record.show);

        return {
            objectId: record.objectId,
            title: this.normalizeString(record.title) ?? "",
            baseUrl: this.normalizeString(record.baseUrl) ?? "",
            langPointers: languagePointers,
            languages: languagePointers,
            tags: this.normalizeStringArray(record.tags),
            features: this.normalizeStringArray(record.features),
            lastUploaded: this.normalizeParseDate(record.lastUploaded),
            harvestState: this.normalizeString(record.harvestState),
            harvestStartedAt: this.normalizeParseDate(record.harvestStartedAt),
            pageCount: this.normalizePageCount(record.pageCount),
            phashOfFirstContentImage: this.normalizeString(
                record.phashOfFirstContentImage
            ),
            bookHashFromImages: this.normalizeString(record.bookHashFromImages),
            allTitles: this.normalizeString(record.allTitles),
            edition: this.normalizeString(record.edition),
            draft: this.normalizeBoolean(record.draft),
            rebrand: this.normalizeBoolean(record.rebrand),
            inCirculation: this.normalizeBoolean(record.inCirculation),
            show,
            lang1Tag: this.extractLang1Tag(show),
        };
    }

    private normalizeLanguagePointers(
        value: unknown
    ): LanguageModel[] | undefined {
        if (!Array.isArray(value)) {
            return undefined;
        }

        const languages = value
            .map((entry) => {
                if (entry instanceof LanguageModel) {
                    return entry;
                }
                if (typeof entry === "object" && entry !== null) {
                    return new LanguageModel(entry as Partial<LanguageModel>);
                }
                return undefined;
            })
            .filter((entry): entry is LanguageModel => entry !== undefined);

        return languages.length > 0 ? languages : undefined;
    }

    private normalizeStringArray(value: unknown): string[] | undefined {
        if (!Array.isArray(value)) {
            return undefined;
        }

        const strings = value
            .map((entry) => (typeof entry === "string" ? entry : undefined))
            .filter((entry): entry is string => entry !== undefined);

        return strings.length > 0 ? strings : undefined;
    }

    private normalizeParseDate(value: unknown): ParseDate | undefined {
        if (
            typeof value === "object" &&
            value !== null &&
            "iso" in value &&
            typeof (value as { iso?: unknown }).iso === "string"
        ) {
            return { iso: (value as { iso: string }).iso };
        }
        return undefined;
    }

    private normalizePageCount(value: unknown): string | number | undefined {
        if (typeof value === "string" || typeof value === "number") {
            return value;
        }
        return undefined;
    }

    private normalizeString(value: unknown): string | undefined {
        return typeof value === "string" ? value : undefined;
    }

    private normalizeBoolean(value: unknown): boolean | undefined {
        return typeof value === "boolean" ? value : undefined;
    }

    private normalizeShow(value: unknown): Record<string, unknown> | undefined {
        if (typeof value !== "object" || value === null) {
            return undefined;
        }
        return value as Record<string, unknown>;
    }

    private extractLang1Tag(
        show: Record<string, unknown> | undefined
    ): string | undefined {
        if (!show) {
            return undefined;
        }
        const pdf = show["pdf"];
        if (
            typeof pdf === "object" &&
            pdf !== null &&
            "langTag" in pdf &&
            typeof (pdf as { langTag?: unknown }).langTag === "string"
        ) {
            return (pdf as { langTag: string }).langTag;
        }
        return undefined;
    }

    private getBookDetailFields(): string {
        return (
            "title,allTitles,baseUrl,bookOrder,inCirculation,draft,license,licenseNotes,summary,copyright,harvestState,harvestLog," +
            "tags,pageCount,phashOfFirstContentImage,bookHashFromImages," +
            "show," +
            "credits,country,features,internetLimits," +
            "librarianNote,uploader,langPointers,importedBookSourceUrl,downloadCount,suitableForMakingShells,lastUploaded," +
            "harvestStartedAt,publisher,originalPublisher,keywords,bookInstanceId,brandingProjectName,edition,rebrand,bloomPUBVersion"
        );
    }

    private getGridBookKeys(): string {
        return (
            "objectId,bookInstanceId," +
            "title,baseUrl,license,licenseNotes,inCirculation,draft,summary,copyright,harvestState," +
            "harvestLog,harvestStartedAt,tags,pageCount,phashOfFirstContentImage,bookHashFromImages,show,credits,country," +
            "features,internetLimits,librarianNote,uploader,langPointers,importedBookSourceUrl," +
            "downloadCount,publisher,originalPublisher,brandingProjectName,keywords,edition,rebrand,leveledReaderLevel," +
            "analytics_finishedCount,analytics_startedCount,analytics_shellDownloads"
        );
    }
}

function isParseBookRecord(value: unknown): value is ParseBookRecord {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as { objectId?: unknown };
    return typeof candidate.objectId === "string";
}

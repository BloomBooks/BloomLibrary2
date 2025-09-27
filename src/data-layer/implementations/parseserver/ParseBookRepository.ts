// ParseServer implementation of Book repository
import axios from "axios";
import { IBookRepository } from "../../interfaces/IBookRepository";
import { BookModel } from "../../models/BookModel";
import { BookFilter } from "../../types/FilterTypes";
import {
    BookSearchQuery,
    BookGridQuery,
    BookSearchResult,
    BookGridResult,
} from "../../types/QueryTypes";
import { BooleanOptions, BookOrderingScheme } from "../../types/CommonTypes";
import { ParseConnection } from "./ParseConnection";
import { Book, createBookFromParseServerData } from "../../../model/Book";
import { IFilter } from "../../../IFilter";
import { constructParseBookQuery } from "../../../connection/BookQueryBuilder";
import { ArtifactVisibilitySettingsGroup } from "../../../model/ArtifactVisibilitySettings";

export class ParseBookRepository implements IBookRepository {
    // Basic CRUD operations
    async getBook(id: string): Promise<BookModel | null> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/books`, {
                headers: connection.headers,
                params: {
                    where: JSON.stringify({ objectId: id }),
                    keys: this.getBookDetailFields(),
                    include: "uploader,langPointers",
                },
            });

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

    async getBooks(ids: string[]): Promise<BookModel[]> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/books`, {
                headers: connection.headers,
                params: {
                    where: JSON.stringify({ objectId: { $in: ids } }),
                    keys: this.getGridBookKeys(),
                    include: "uploader,langPointers",
                },
            });

            return response.data.results.map((bookData: any) =>
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
                },
                this.convertBookFilterToParseFilter(query.filter),
                [], // tags - would need to be passed in
                query.orderingScheme || BookOrderingScheme.Default
            );

            const response = await axios.post(
                `${connection.url}classes/books`,
                {
                    _method: "GET",
                    ...queryParams,
                },
                { headers: connection.headers }
            );

            const books = response.data.results.map((bookData: any) =>
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

    async getBookCount(filter: BookFilter): Promise<number> {
        const connection = ParseConnection.getConnection();

        try {
            const parseFilter = this.convertBookFilterToParseFilter(filter);
            console.log(
                "DEBUG: ParseBookRepository.getBookCount filter:",
                filter
            );
            console.log(
                "DEBUG: ParseBookRepository.getBookCount parseFilter:",
                parseFilter
            );
            const queryParams = constructParseBookQuery(
                { limit: 0, count: 1 },
                parseFilter,
                [], // tags - would need to be passed in
                BookOrderingScheme.None
            );
            console.log(
                "DEBUG: ParseBookRepository.getBookCount queryParams:",
                queryParams
            );

            const response = await axios.post(
                `${connection.url}classes/books`,
                {
                    _method: "GET",
                    ...queryParams,
                },
                { headers: connection.headers }
            );

            const count = parseInt(response.data.count, 10) || 0;
            console.log(
                "DEBUG: ParseBookRepository.getBookCount response count:",
                count
            );
            return count;
        } catch (error) {
            console.error("Error getting book count:", error);
            return 0;
        }
    }

    async getRelatedBooks(bookId: string): Promise<BookModel[]> {
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

            return response.data.results[0].books
                .filter(
                    (r: any) =>
                        r.objectId !== bookId && r.inCirculation !== false
                )
                .map((bookData: any) =>
                    this.convertParseDataToBookModel(bookData)
                );
        } catch (error) {
            console.error("Error getting related books:", error);
            return [];
        }
    }

    // Specialized operations
    async getBookDetail(id: string): Promise<BookModel | null> {
        return this.getBook(id);
    }

    async saveArtifactVisibility(id: string, settings: any): Promise<void> {
        await this.updateBook(id, settings as Partial<BookModel>);
    }

    // Additional operations found in current codebase
    async getBasicBookInfos(ids: string[]): Promise<any[]> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/books`, {
                headers: connection.headers,
                params: {
                    where: JSON.stringify({ objectId: { $in: ids } }),
                    keys:
                        "title,baseUrl,objectId,langPointers,tags,features,lastUploaded,harvestState,harvestStartedAt,pageCount,phashOfFirstContentImage,bookHashFromImages,allTitles,edition,draft,rebrand,inCirculation,show",
                    include: "langPointers",
                },
            });

            return response.data.results.map((rawInfo: any) => {
                const bookInfo: any = { ...rawInfo };
                bookInfo.languages = rawInfo.langPointers;
                bookInfo.lang1Tag = bookInfo.show?.pdf?.langTag;
                return bookInfo;
            });
        } catch (error) {
            console.error("Error getting basic book infos:", error);
            return [];
        }
    }

    async getCurrentBookData(bookId: string): Promise<any> {
        const book = await this.getBook(bookId);
        return book;
    }

    // Helper methods for data conversion
    private convertBookFilterToParseFilter(filter: BookFilter): IFilter {
        return {
            search: filter.search,
            language: filter.language,
            topic: filter.topic,
            feature: filter.feature,
            inCirculation: filter.inCirculation,
            draft: filter.draft,
            publisher: filter.publisher,
            originalPublisher: filter.originalPublisher,
            bookshelf: filter.bookshelf,
            otherTags: filter.otherTags,
            derivedFrom: filter.derivedFrom
                ? this.convertBookFilterToParseFilter(filter.derivedFrom)
                : undefined,
            keywordsText: filter.keywordsText,
            brandingProjectName: filter.brandingProjectName,
            edition: filter.edition,
            bookInstanceId: filter.bookInstanceId,
            rebrand: filter.rebrand,
            leveledReaderLevel: filter.leveledReaderLevel,
            bookShelfCategory: filter.bookShelfCategory,
            originalCredits: filter.originalCredits,
            anyOfThese: filter.anyOfThese
                ? filter.anyOfThese.map((childFilter) =>
                      this.convertBookFilterToParseFilter(childFilter)
                  )
                : undefined,
        };
    }

    private convertParseDataToBookModel(data: any): BookModel {
        try {
            // Create a Book object first using existing logic
            const book = createBookFromParseServerData(data);

            // Convert to BookModel
            const bookModel = new BookModel();
            bookModel.objectId = book.id;
            bookModel.createdAt = data.createdAt || new Date().toISOString();
            bookModel.updatedAt = data.updatedAt || new Date().toISOString();
            bookModel.title = book.title;
            // Parse allTitles and convert to Map
            let allTitlesObj = {};
            if (typeof data.allTitles === "string") {
                allTitlesObj = JSON.parse(data.allTitles);
            } else if (data.allTitles && typeof data.allTitles === "object") {
                allTitlesObj = data.allTitles;
            }
            bookModel.allTitles = new Map(Object.entries(allTitlesObj));
            bookModel.baseUrl = book.baseUrl;
            bookModel.license = book.license;
            bookModel.copyright = book.copyright;
            // Handle tags - convert from object with numeric keys to array if needed
            if (Array.isArray(book.tags)) {
                bookModel.tags = book.tags;
            } else if (typeof book.tags === "string") {
                bookModel.tags = (book.tags as string).split(",");
            } else if (book.tags && typeof book.tags === "object") {
                // Convert object with numeric keys to array
                bookModel.tags = Object.values(book.tags as any);
            } else {
                bookModel.tags = [];
            }
            bookModel.summary = book.summary;
            bookModel.pageCount = (parseInt(book.pageCount) || 0).toString();
            bookModel.languages = data.langPointers || [];
            // Handle features - convert from object with numeric keys to array if needed
            if (Array.isArray(book.features)) {
                bookModel.features = book.features;
            } else if (book.features && typeof book.features === "object") {
                // Convert object with numeric keys to array
                bookModel.features = Object.values(book.features as any);
            } else {
                bookModel.features = [];
            }
            bookModel.inCirculation = book.inCirculation;
            bookModel.draft = book.draft;
            bookModel.harvestState = book.harvestState;
            bookModel.uploader = data.uploader;
            bookModel.downloadCount = book.downloadCount || 0;
            bookModel.country = book.country;
            bookModel.publisher = book.publisher;
            bookModel.originalPublisher = book.originalPublisher;
            bookModel.bookInstanceId = book.bookInstanceId;
            bookModel.brandingProjectName = book.brandingProjectName;
            bookModel.edition = book.edition;
            bookModel.rebrand = book.rebrand;
            bookModel.phashOfFirstContentImage = book.phashOfFirstContentImage;
            bookModel.bookHashFromImages = book.bookHashFromImages;
            bookModel.internetLimits = book.internetLimits || {};

            // Convert show field to artifactsToOfferToUsers (critical for button visibility)
            bookModel.artifactsToOfferToUsers = ArtifactVisibilitySettingsGroup.createFromParseServerData(
                data.show
            );

            return bookModel;
        } catch (error) {
            console.error("Error in convertParseDataToBookModel:", error);
            console.error("Input data was:", data);
            throw error;
        }
    }

    private convertBookModelToParseData(book: Partial<BookModel>): any {
        const data: any = {};

        if (book.title !== undefined) data.title = book.title;
        if (book.allTitles !== undefined)
            data.allTitles = JSON.stringify(book.allTitles);
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

        return data;
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

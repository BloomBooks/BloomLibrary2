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
                    count: 1, // Request total count from Parse Server
                },
                this.convertBookFilterToParseFilter(query.filter),
                [], // tags - would need to be passed in
                query.orderingScheme || BookOrderingScheme.Default
            );

            // Convert where clause to JSON string for GET request
            const params: Record<string, any> = { ...queryParams };
            if (params.where) {
                params.where = JSON.stringify(params.where);
            }

            const response = await axios.get(`${connection.url}classes/books`, {
                headers: connection.headers,
                params: params,
            });

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

            // Convert where clause to JSON string for GET request
            const params: Record<string, any> = { ...queryParams };
            if (params.where) {
                params.where = JSON.stringify(params.where);
            }

            const response = await axios.get(`${connection.url}classes/books`, {
                headers: connection.headers,
                params: params,
            });

            const count = parseInt(response.data.count, 10) || 0;
            console.log(
                "DEBUG: ParseBookRepository.getBookCount response count:",
                count
            );
            return count;
        } catch (error) {
            console.error("Error getting book count:", error);
            throw error;
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

    private convertParseDataToBookModel(data: any): any {
        try {
            // Create a Book object using existing logic
            // The UI components expect Book instances with methods like getBestLevel()
            const book = createBookFromParseServerData(data);

            console.log(
                "DEBUG: convertParseDataToBookModel created book:",
                book
            );
            console.log(
                "DEBUG: book has getBestLevel?",
                typeof book.getBestLevel === "function"
            );

            return book;
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

        // Handle language pointers - convert from domain model to Parse format
        if (book.languages !== undefined) {
            data.langPointers = book.languages.map((lang: any) => ({
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

// Repository interface for book-related operations
import {
    BookSearchQuery,
    BookGridQuery,
    BookSearchResult,
    BookGridResult,
} from "../types/QueryTypes";
import { IFilter } from "FilterTypes";
import type { BookModel } from "../models/BookModel";
import type { LanguageModel } from "../models/LanguageModel";
import type { ParseDate } from "../types/CommonTypes";
import type { ArtifactVisibilitySettingsGroup } from "../../model/ArtifactVisibilitySettings";
import type { Book } from "../../model/Book";

export interface BasicBookInfoRecord {
    objectId: string;
    title: string;
    baseUrl: string;
    langPointers?: LanguageModel[];
    languages?: LanguageModel[];
    tags?: string[];
    features?: string[];
    lastUploaded?: ParseDate;
    harvestState?: string;
    harvestStartedAt?: ParseDate;
    pageCount?: string | number;
    phashOfFirstContentImage?: string;
    bookHashFromImages?: string;
    allTitles?: string;
    edition?: string;
    draft?: boolean;
    rebrand?: boolean;
    inCirculation?: boolean;
    show?: Record<string, unknown>;
    lang1Tag?: string;
    [key: string]: unknown;
}

export type ArtifactVisibilitySettings = ArtifactVisibilitySettingsGroup;

export type BookEntity = Book;

export interface IBookRepository {
    // Basic CRUD operations
    getBook(id: string): Promise<BookEntity | null>;
    getBooks(ids: string[]): Promise<BookEntity[]>;
    searchBooks(query: BookSearchQuery): Promise<BookSearchResult>;
    updateBook(id: string, updates: Partial<BookModel>): Promise<void>;
    deleteBook(id: string): Promise<void>;

    // Complex queries
    getBooksForGrid(query: BookGridQuery): Promise<BookGridResult>;
    getBookCount(filter: IFilter): Promise<number>;
    getRelatedBooks(bookId: string): Promise<BookEntity[]>;

    // Specialized operations
    getBookDetail(id: string): Promise<BookEntity | null>;
    saveArtifactVisibility(
        id: string,
        settings: ArtifactVisibilitySettings
    ): Promise<void>;

    // Additional operations found in current codebase
    getBasicBookInfos(ids: string[]): Promise<BasicBookInfoRecord[]>;
    getCurrentBookData(bookId: string): Promise<BookEntity | null>;
}

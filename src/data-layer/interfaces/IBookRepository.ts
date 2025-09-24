// Repository interface for book-related operations
import {
    BookSearchQuery,
    BookGridQuery,
    BookSearchResult,
    BookGridResult,
} from "../types/QueryTypes";
import { BookFilter } from "../types/FilterTypes";

// Forward declaration - will be implemented in models
export interface BookModel {
    id: string;
    bookInstanceId: string;
    title: string;
    baseUrl: string;
    // More fields will be added when we create the actual BookModel
}

export interface ArtifactVisibilitySettings {
    // Will be defined based on existing ArtifactVisibilitySettingsGroup
    [key: string]: any;
}

export interface IBookRepository {
    // Basic CRUD operations
    getBook(id: string): Promise<BookModel | null>;
    getBooks(ids: string[]): Promise<BookModel[]>;
    searchBooks(query: BookSearchQuery): Promise<BookSearchResult>;
    updateBook(id: string, updates: Partial<BookModel>): Promise<void>;
    deleteBook(id: string): Promise<void>;

    // Complex queries
    getBooksForGrid(query: BookGridQuery): Promise<BookGridResult>;
    getBookCount(filter: BookFilter): Promise<number>;
    getRelatedBooks(bookId: string): Promise<BookModel[]>;

    // Specialized operations
    getBookDetail(id: string): Promise<BookModel | null>;
    saveArtifactVisibility(
        id: string,
        settings: ArtifactVisibilitySettings
    ): Promise<void>;

    // Additional operations found in current codebase
    getBasicBookInfos(ids: string[]): Promise<any[]>; // Will type properly later
    getCurrentBookData(bookId: string): Promise<any>;
}

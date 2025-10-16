// Query-related types for database operations
import { BookOrderingScheme, Pagination, Sorting } from "./CommonTypes";
import { IFilter, LanguageFilter, TagFilter, UserFilter } from "FilterTypes";
import type { BookEntity } from "../interfaces/IBookRepository";

// Base query interface
export interface BaseQuery {
    pagination?: Pagination;
    fieldSelection?: string[];
}

// Book query types
export interface BookSearchQuery extends BaseQuery {
    filter: IFilter;
    orderingScheme?: BookOrderingScheme;
    languageForSorting?: string;
}

export interface BookGridQuery extends BaseQuery {
    filter: IFilter;
    sorting: Sorting[];
}

// Language query types
export interface LanguageQuery extends BaseQuery {
    filter?: LanguageFilter;
    orderBy?: "usageCount" | "name" | "isoCode";
    orderDescending?: boolean;
}

// User query types
export interface UserQuery extends BaseQuery {
    filter?: UserFilter;
}

// Tag query types
export interface TagQuery extends BaseQuery {
    filter?: TagFilter;
    orderBy?: "name";
    orderDescending?: boolean;
}

// Result types
export interface QueryResult<T> {
    items: T[];
    totalCount?: number;
    hasMore?: boolean;
}

export interface BookSearchResult extends QueryResult<BookEntity> {
    books: BookEntity[];
    totalMatchingRecords: number;
    errorString: string | null;
    waiting: boolean;
}

export interface BookGridResult {
    onePageOfMatchingBooks: BookEntity[];
    totalMatchingBooksCount: number;
}

// Parse server specific result format
export interface ParseResponseData<T = unknown> {
    count?: number;
    results: Array<T>;
}

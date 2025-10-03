// Filter types for querying books and other entities
import { BooleanOptions } from "./CommonTypes";

export interface IFilter {
    language?: string; // BCP 47 language code
    publisher?: string;
    originalPublisher?: string;
    originalCredits?: string;
    bookshelf?: string;
    feature?: string;
    topic?: string;
    bookShelfCategory?: string;
    otherTags?: string;

    // Boolean filters with tri-state options
    inCirculation?: BooleanOptions;
    draft?: BooleanOptions;
    rebrand?: BooleanOptions;

    // Text search
    search?: string;
    keywordsText?: string;
    brandingProjectName?: string;

    // Derivative collections can be defined one of two ways:
    // 1) derivedFrom - a filter which defines the books you want derivatives of
    // 2) derivedFromCollectionName - the name of a collection which contains the books you want derivatives of
    derivedFrom?: IFilter;
    derivedFromCollectionName?: string;

    edition?: string;

    // Union operation - combine multiple filters with OR logic
    anyOfThese?: IFilter[];

    leveledReaderLevel?: number;
    bookInstanceId?: string;
}

export { BooleanOptions, parseBooleanOptions } from "./CommonTypes";

export interface LanguageFilter {
    isoCode?: string;
    usageCountGreaterThan?: number;
    hasUsageCount?: boolean;
}

export interface UserFilter {
    email?: string;
    username?: string;
    moderator?: boolean;
}

export interface TagFilter {
    name?: string;
    category?: string;
}

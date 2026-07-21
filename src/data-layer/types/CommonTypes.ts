// Common types used across the data layer

export enum BooleanOptions {
    No = "No",
    Yes = "Yes",
    All = "All",
}

export function parseBooleanOptions(value: unknown): BooleanOptions {
    switch (value) {
        case true:
        case "True":
        case "true":
        case "Yes":
        case "yes":
            return BooleanOptions.Yes;

        case false:
        case "False":
        case "false":
        case "No":
        case "no":
            return BooleanOptions.No;

        default:
            return BooleanOptions.All;
    }
}

// The string values here must match what we have Contentful putting out.
export enum BookOrderingScheme {
    Default = "default",
    NewestCreationsFirst = "newest-first",
    LastUploadedFirst = "last-uploaded-first",
    TitleAlphabetical = "title",
    TitleAlphaIgnoringNumbers = "title-ignore-numbers",
    None = "none", // used for queries getting counts instead of actual lists of books
}

// Pagination parameters for queries
export interface Pagination {
    limit?: number;
    skip?: number;
}

// Sorting configuration
export interface Sorting {
    columnName: string;
    descending: boolean;
}

// Common fields that all database entities have
export interface CommonEntityFields {
    objectId: string;
    createdAt: string;
    updatedAt: string;
}

// Date objects for uploads and modifications
export interface ParseDate {
    iso: string;
}

// Media/image information
export interface MediaInfo {
    url: string;
    altText?: string;
    credits?: string;
}

// Country specification
export interface CountrySpec {
    countryCode: string; // two-letter code
}

// Internet limits configuration
export interface InternetLimits {
    viewContentsInAnyWay?: CountrySpec;
    downloadAnything?: CountrySpec;
    downloadShell?: CountrySpec;
}

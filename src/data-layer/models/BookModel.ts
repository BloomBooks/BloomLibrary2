// Business domain model for Book entity
import { observable, makeObservable } from "mobx";
import {
    CommonEntityFields,
    ParseDate,
    InternetLimits,
} from "../types/CommonTypes";
import { LanguageModel } from "./LanguageModel";
import { BookStatsModel } from "../interfaces/IAnalyticsService";
// Note: These imports will be properly resolved when integrating with the existing codebase
// import { removePunctuation } from "../../Utilities";
// import stem from "wink-porter2-stemmer";

// Temporary placeholders for testing
const removePunctuation = (text: string) => text.replace(/[^\w\s]/gi, "");
const stem = (text: string) => text.toLowerCase();

export interface ArtifactVisibilitySettingsGroup {
    // Will be properly typed when we migrate this interface
    [key: string]: any;
}

export interface BookUploader {
    username: string;
}

export class BookModel implements CommonEntityFields {
    // Core identification
    public objectId: string = "";
    public id: string = "";
    public bookInstanceId: string = "";
    public title: string = "";
    public originalTitle: string = "";
    public baseUrl: string = "";

    // Metadata
    public allTitles = new Map<string, string>();
    public allTitlesRaw = "";
    public languages: LanguageModel[] = [];
    public tags: string[] = [];
    public features: string[] = [];
    public publisher: string = "";
    public originalPublisher: string = "";
    public copyright: string = "";
    public license: string = "";
    public licenseNotes: string = "";
    public edition: string = "";

    // Content
    public pageCount: string = "";
    public summary: string = "";
    public credits: string = "";
    public bookOrder: string = "";

    // State management
    public harvestState: string = "";
    public harvestLog: string[] = [];
    public inCirculation: boolean = true;
    public draft: boolean = false;
    public rebrand: boolean = false;
    public suitableForMakingShells = false;

    // Specialized fields
    public level: string = "";
    public librarianNote: string = "";
    public brandingProjectName = "";
    public country: string = "";
    public internetLimits: InternetLimits = {};
    public downloadCount: number = -1;
    public phashOfFirstContentImage: string = "";
    public bookHashFromImages: string = "";
    public importedBookSourceUrl?: string;
    public ePUBVisible: boolean = false;
    public bloomPUBVersion: number | undefined;

    // Artifact settings
    public artifactsToOfferToUsers: ArtifactVisibilitySettingsGroup = {};

    // Keywords
    public keywordsText: string = "";
    public keywords: string[] = [];
    public keywordStems: string[] = [];

    // Analytics
    public stats: BookStatsModel = {
        title: "",
        branding: "",
        questions: 0,
        quizzesTaken: 0,
        meanCorrect: 0,
        medianCorrect: 0,
        language: "",
        startedCount: 0,
        finishedCount: 0,
        shellDownloads: 0,
        pdfDownloads: 0,
        epubDownloads: 0,
        bloomPubDownloads: 0,
    };

    // User and dates
    public uploader: BookUploader | undefined;
    public createdAt: string = "";
    public updatedAt: string = "";
    public uploadDate: Date | undefined;
    public updateDate: Date | undefined;
    public lastUploadedDate: Date | undefined;
    private lastUploaded: ParseDate | undefined;
    public harvestStartedAt: ParseDate | undefined;

    constructor() {
        makeObservable(this, {
            title: observable,
            summary: observable,
            tags: observable,
            level: observable,
            librarianNote: observable,
            inCirculation: observable,
            draft: observable,
            publisher: observable,
            originalPublisher: observable,
            features: observable,
            edition: observable,
            keywordsText: observable,
            keywords: observable,
            artifactsToOfferToUsers: observable,
            rebrand: observable,
            bloomPUBVersion: observable,
        });
    }

    // Business methods
    public getHarvestLog(): string {
        return this.harvestLog.join(" / ");
    }

    public getMissingFontNames(): string[] {
        const fixedMarker = "MissingFont - ";
        return this.harvestLog
            .filter((entry) => entry.indexOf(fixedMarker) >= 0)
            .map((entry) => entry.split(fixedMarker)[1].trim());
    }

    public getBestLevel(): string | undefined {
        if (this.level) return this.level;
        return this.getTagValue("computedLevel");
    }

    public getTagValue(tag: string): string | undefined {
        const axisAndValue = this.tags.find((t) => t.startsWith(tag + ":"));
        if (axisAndValue) {
            return axisAndValue.split(":")[1].trim();
        } else return undefined;
    }

    public setBooleanTag(name: string, value: boolean): void {
        const i = this.tags.indexOf(name);
        if (i > -1 && !value) {
            this.tags.splice(i, 1);
        }
        if (i < 0 && value) {
            this.tags.push(name);
        }
    }

    public getBestTitle(langISO?: string): string {
        const t = langISO ? this.allTitles.get(langISO) : this.title;
        return (t || this.title).replace(/[\\r\\n\\v]+/g, " ");
    }

    public getKeywordsText(): string {
        if (!this.keywords) {
            return "";
        }
        return this.keywords.join(BookModel.keywordDelimiter);
    }

    // Static methods
    private static readonly keywordDelimiter: string = " ";

    public static getKeywordsAndStems(
        keywordsText: string
    ): [string[], string[]] {
        const keywords = this.splitKeywordsText(keywordsText);
        const keywordStems = keywords.map(BookModel.stemKeyword);
        return [keywords, keywordStems];
    }

    private static splitKeywordsText(keywordsText: string): string[] {
        const tokens = keywordsText.split(BookModel.keywordDelimiter);
        const keywords = tokens.filter((token) => token.length > 0);
        return keywords;
    }

    public static stemKeyword(keyword: string): string {
        return stem(removePunctuation(keyword.toLowerCase()));
    }

    public static sanitizeFeaturesArray(features: string[]): void {
        if (features.includes("quiz") && !features.includes("activity")) {
            features.push("activity");
        }
        if (features.includes("widgets") && !features.includes("activity")) {
            features.push("activity");
        }
    }

    // Utility methods for harvested content
    public static isHarvested(book: BookModel | any): boolean {
        return book && book.harvestState === "Done";
    }

    public static getThumbnailUrl(
        book: BookModel | any
    ): { thumbnailUrl: string; isModernThumbnail: boolean } {
        const h = BookModel.getHarvesterProducedThumbnailUrl(book, "256");
        if (h) return { thumbnailUrl: h, isModernThumbnail: true };
        return {
            thumbnailUrl: BookModel.getLegacyThumbnailUrl(book),
            isModernThumbnail: false,
        };
    }

    public static getLegacyThumbnailUrl(book: BookModel | any): string {
        return (
            BookModel.getCloudFlareUrl(book.baseUrl) +
            "thumbnail-256.png?version=" +
            book.updatedAt
        );
    }

    // Private helper methods
    private static getHarvesterProducedThumbnailUrl(
        book: any,
        size: string
    ): string | undefined {
        // Implementation would be extracted from current Book class
        return undefined; // Placeholder
    }

    private static getCloudFlareUrl(inputUrl: string): string {
        // Implementation would be extracted from current Book class
        return inputUrl; // Placeholder
    }

    public static getHarvesterBaseUrl(
        book: BookModel | any
    ): string | undefined {
        // Implementation would be extracted from current Book class
        return undefined; // Placeholder
    }
}

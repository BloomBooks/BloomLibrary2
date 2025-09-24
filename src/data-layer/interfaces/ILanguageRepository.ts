// Repository interface for language-related operations
import { LanguageQuery, QueryResult } from "../types/QueryTypes";
import { LanguageFilter } from "../types/FilterTypes";

// Forward declaration - will be implemented in models
export interface LanguageModel {
    objectId: string;
    name: string;
    isoCode: string;
    usageCount: number;
    englishName?: string;
    bannerImageUrl?: string;
}

export interface ILanguageRepository {
    // Basic CRUD operations
    getLanguage(id: string): Promise<LanguageModel | null>;
    getLanguageByCode(isoCode: string): Promise<LanguageModel | null>;
    getLanguages(query?: LanguageQuery): Promise<QueryResult<LanguageModel>>;

    // Specialized operations from current codebase
    getCleanedAndOrderedLanguageList(): Promise<LanguageModel[]>;
    getLanguageInfo(languageCode: string): Promise<LanguageModel[]>;

    // Display name operations
    getDisplayNamesFromLanguageCode(
        languageCode: string,
        languages: LanguageModel[]
    ):
        | {
              primary: string;
              secondary: string | undefined;
              combined: string;
          }
        | undefined;
}

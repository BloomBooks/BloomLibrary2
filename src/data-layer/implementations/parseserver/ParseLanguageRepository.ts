import axios from "axios";
import type { AxiosError } from "axios";
import { ILanguageRepository } from "../../interfaces/ILanguageRepository";
import { LanguageModel } from "../../models/LanguageModel";
import { LanguageQuery, QueryResult } from "../../types/QueryTypes";
import { LanguageFilter } from "FilterTypes";
import { ParseConnection } from "./ParseConnection";
import {
    getCleanedAndOrderedLanguageList as legacyCleanLanguageList,
    getDisplayNamesFromLanguageCode as legacyDisplayNames,
    ILanguage,
} from "../../../model/Language";

interface ParseLanguageRecord {
    objectId: string;
    name?: string;
    isoCode?: string;
    usageCount?: number;
    englishName?: string;
    bannerImageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

function isAxiosErrorLike(error: unknown): error is AxiosError {
    return (
        typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error &&
        (error as { isAxiosError?: unknown }).isAxiosError === true
    );
}

export class ParseLanguageRepository implements ILanguageRepository {
    async getLanguage(id: string): Promise<LanguageModel | null> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(
                `${connection.url}classes/language`,
                {
                    headers: connection.headers,
                    params: {
                        where: JSON.stringify({ objectId: id }),
                        limit: 1,
                    },
                }
            );

            const languageData: ParseLanguageRecord | undefined =
                response.data?.results?.[0];
            if (!languageData) {
                return null;
            }

            return this.convertParseLanguageToModel(languageData);
        } catch (error) {
            console.error("Error getting language by ID:", error);
            return null;
        }
    }

    async getLanguageByCode(isoCode: string): Promise<LanguageModel | null> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(
                `${connection.url}classes/language`,
                {
                    headers: connection.headers,
                    params: {
                        where: JSON.stringify({ isoCode }),
                        limit: 1,
                    },
                }
            );

            const languageData: ParseLanguageRecord | undefined =
                response.data?.results?.[0];
            if (!languageData) {
                return null;
            }

            return this.convertParseLanguageToModel(languageData);
        } catch (error) {
            console.error("Error getting language by isoCode:", error);
            return null;
        }
    }

    async getLanguages(
        query?: LanguageQuery
    ): Promise<QueryResult<LanguageModel>> {
        const connection = ParseConnection.getConnection();

        try {
            const params = this.buildQueryParams(query);
            const response = await axios.get(
                `${connection.url}classes/language`,
                {
                    headers: connection.headers,
                    params,
                }
            );

            const parseLanguages: ParseLanguageRecord[] =
                response.data?.results ?? [];
            const languageModels = parseLanguages.map((record) =>
                this.convertParseLanguageToModel(record)
            );

            const totalCount =
                Number(response.data?.count) || languageModels.length;
            const limit = query?.pagination?.limit;

            return {
                items: languageModels,
                totalCount,
                hasMore:
                    limit !== undefined
                        ? languageModels.length === limit
                        : false,
            };
        } catch (error) {
            console.error("Error querying languages:", error);
            return { items: [], totalCount: 0, hasMore: false };
        }
    }

    async getCleanedAndOrderedLanguageList(): Promise<LanguageModel[]> {
        const connection = ParseConnection.getConnection();

        try {
            const whereClause = encodeURIComponent(
                JSON.stringify({
                    $or: [
                        { usageCount: { $gt: 0 } },
                        { usageCount: { $exists: false } },
                    ],
                })
            );

            const url = `${connection.url}classes/language?keys=name,englishName,usageCount,isoCode&where=${whereClause}&limit=10000&order=-usageCount`;

            const response = await axios.get(url, {
                headers: connection.headers,
            });

            const languages = (
                response.data?.results ?? []
            ).map((record: ParseLanguageRecord) =>
                this.convertParseLanguageToModel(record)
            );

            const cleaned = legacyCleanLanguageList(
                languages.map((language: LanguageModel) =>
                    this.convertToLegacyLanguage(language)
                )
            );

            const finalLanguages = cleaned.map(
                (language) => new LanguageModel(language)
            );

            return finalLanguages;
        } catch (error: unknown) {
            // During testing or when ParseServer is unavailable, fail silently
            // to avoid console errors that break tests
            if (process.env.NODE_ENV === "test") {
                return [];
            }

            if (isAxiosErrorLike(error)) {
                if (
                    error.response?.status === 400 ||
                    error.code === "ECONNREFUSED"
                ) {
                    return [];
                }
            }
            console.error("Error retrieving cleaned language list:", error);
            return [];
        }
    }

    async getLanguageInfo(languageCode: string): Promise<LanguageModel[]> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(
                `${connection.url}classes/language`,
                {
                    headers: connection.headers,
                    params: {
                        where: JSON.stringify({ isoCode: languageCode }),
                        keys:
                            "isoCode,name,usageCount,bannerImageUrl,englishName,objectId",
                    },
                }
            );

            return (
                response.data?.results ?? []
            ).map((record: ParseLanguageRecord) =>
                this.convertParseLanguageToModel(record)
            );
        } catch (error) {
            console.error("Error retrieving language info:", error);
            return [];
        }
    }

    getDisplayNamesFromLanguageCode(
        languageCode: string,
        languages: LanguageModel[]
    ) {
        const legacyLanguages: ILanguage[] = languages.map((language) =>
            this.convertToLegacyLanguage(language)
        );
        return legacyDisplayNames(languageCode, legacyLanguages);
    }

    private convertParseLanguageToModel(
        language: ParseLanguageRecord
    ): LanguageModel {
        return new LanguageModel({
            objectId: language.objectId,
            name: language.name ?? "",
            isoCode: language.isoCode ?? "",
            usageCount:
                language.usageCount !== undefined ? language.usageCount : 0,
            englishName: language.englishName,
            bannerImageUrl: language.bannerImageUrl,
            createdAt: language.createdAt ?? new Date().toISOString(),
            updatedAt: language.updatedAt ?? new Date().toISOString(),
        });
    }

    private buildQueryParams(query?: LanguageQuery): Record<string, unknown> {
        const params: Record<string, unknown> = {
            count: 1,
        };

        if (!query) {
            params.order = "-usageCount";
            return params;
        }

        if (query.pagination?.limit !== undefined) {
            params.limit = query.pagination.limit;
        }
        if (query.pagination?.skip !== undefined) {
            params.skip = query.pagination.skip;
        }

        if (query.fieldSelection?.length) {
            params.keys = query.fieldSelection.join(",");
        }

        const where = this.buildLanguageFilter(query.filter);
        if (Object.keys(where).length > 0) {
            params.where = JSON.stringify(where);
        }

        if (query.orderBy) {
            params.order = `${query.orderDescending ? "-" : ""}${
                query.orderBy
            }`;
        } else {
            params.order = "-usageCount";
        }

        return params;
    }

    private buildLanguageFilter(
        filter?: LanguageFilter
    ): Record<string, unknown> {
        const where: Record<string, unknown> = {};

        if (!filter) {
            return where;
        }

        if (filter.isoCode) {
            where.isoCode = filter.isoCode;
        }

        if (filter.usageCountGreaterThan !== undefined) {
            where.usageCount = { $gt: filter.usageCountGreaterThan };
        }

        if (filter.hasUsageCount !== undefined) {
            where.usageCount = {
                ...(where.usageCount as Record<string, unknown>),
                $exists: filter.hasUsageCount,
            };
        }

        return where;
    }

    private convertToLegacyLanguage(language: LanguageModel): ILanguage {
        return {
            name: language.name,
            englishName: language.englishName,
            usageCount: language.usageCount,
            isoCode: language.isoCode,
            bannerImageUrl: language.bannerImageUrl,
            objectId: language.objectId,
        };
    }
}

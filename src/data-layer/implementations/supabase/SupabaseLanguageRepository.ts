import { ILanguageRepository } from "../../interfaces/ILanguageRepository";
import { LanguageModel } from "../../models/LanguageModel";
import { LanguageQuery, QueryResult } from "../../types/QueryTypes";
import { LanguageFilter } from "FilterTypes";
import { SupabaseConnection } from "./SupabaseConnection";
import {
    getCleanedAndOrderedLanguageList as legacyCleanLanguageList,
    getDisplayNamesFromLanguageCode as legacyDisplayNames,
    ILanguage,
} from "../../../model/Language";

interface SupabaseLanguageRecord {
    id: string;
    name?: string | null;
    iso_code?: string | null;
    usage_count?: number | null;
    english_name?: string | null;
    banner_image_url?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export class SupabaseLanguageRepository implements ILanguageRepository {
    async getLanguage(id: string): Promise<LanguageModel | null> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("languages")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (error) {
                console.error("Error getting language by ID:", error);
                return null;
            }
            if (!data) {
                return null;
            }
            return this.convertToModel(data);
        } catch (error) {
            console.error("Error getting language by ID:", error);
            return null;
        }
    }

    async getLanguageByCode(isoCode: string): Promise<LanguageModel | null> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("languages")
                .select("*")
                .eq("iso_code", isoCode)
                .maybeSingle();

            if (error) {
                console.error("Error getting language by isoCode:", error);
                return null;
            }
            if (!data) {
                return null;
            }
            return this.convertToModel(data);
        } catch (error) {
            console.error("Error getting language by isoCode:", error);
            return null;
        }
    }

    async getLanguages(
        query?: LanguageQuery
    ): Promise<QueryResult<LanguageModel>> {
        const client = SupabaseConnection.getClient();
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let q: any = client
                .from("languages")
                .select("*", { count: "exact" });
            q = this.applyLanguageFilter(q, query?.filter);

            const orderBy = query?.orderBy ?? "usageCount";
            const orderColumn =
                orderBy === "usageCount"
                    ? "usage_count"
                    : orderBy === "isoCode"
                    ? "iso_code"
                    : "name";
            q = q.order(orderColumn, {
                ascending: !(query?.orderDescending ?? true),
            });

            if (query?.pagination?.limit !== undefined) {
                const skip = query.pagination.skip ?? 0;
                q = q.range(skip, skip + query.pagination.limit - 1);
            }

            const { data, error, count } = await q;
            if (error) {
                throw error;
            }

            const languageModels = (
                data ?? []
            ).map((record: SupabaseLanguageRecord) =>
                this.convertToModel(record)
            );
            const limit = query?.pagination?.limit;

            return {
                items: languageModels,
                totalCount: count ?? languageModels.length,
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
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("languages")
                .select("id,name,english_name,usage_count,iso_code")
                .or("usage_count.gt.0,usage_count.is.null")
                .order("usage_count", { ascending: false });

            if (error) {
                console.error("Error retrieving cleaned language list:", error);
                return [];
            }

            const languages = (
                data ?? []
            ).map((record: SupabaseLanguageRecord) =>
                this.convertToModel(record)
            );

            const cleaned = legacyCleanLanguageList(
                languages.map((language: LanguageModel) =>
                    this.convertToLegacyLanguage(language)
                )
            );

            return cleaned.map((language) => new LanguageModel(language));
        } catch (error) {
            console.error("Error retrieving cleaned language list:", error);
            return [];
        }
    }

    async getLanguageInfo(languageCode: string): Promise<LanguageModel[]> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("languages")
                .select(
                    "id,iso_code,name,usage_count,banner_image_url,english_name"
                )
                .eq("iso_code", languageCode);

            if (error) {
                console.error("Error retrieving language info:", error);
                return [];
            }

            return (data ?? []).map((record: SupabaseLanguageRecord) =>
                this.convertToModel(record)
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

    private convertToModel(record: SupabaseLanguageRecord): LanguageModel {
        return new LanguageModel({
            objectId: record.id,
            name: record.name ?? "",
            isoCode: record.iso_code ?? "",
            usageCount: record.usage_count ?? 0,
            englishName: record.english_name ?? undefined,
            bannerImageUrl: record.banner_image_url ?? undefined,
            createdAt: record.created_at ?? new Date().toISOString(),
            updatedAt: record.updated_at ?? new Date().toISOString(),
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private applyLanguageFilter(query: any, filter?: LanguageFilter): any {
        let q = query;
        if (!filter) {
            return q;
        }
        if (filter.isoCode) {
            q = q.eq("iso_code", filter.isoCode);
        }
        if (filter.usageCountGreaterThan !== undefined) {
            q = q.gt("usage_count", filter.usageCountGreaterThan);
        }
        if (filter.hasUsageCount !== undefined) {
            q = filter.hasUsageCount
                ? q.not("usage_count", "is", null)
                : q.is("usage_count", null);
        }
        return q;
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

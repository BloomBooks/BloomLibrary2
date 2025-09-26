import axios from "axios";
import { ITagRepository } from "../../interfaces/ITagRepository";
import { TagModel } from "../../models/TagModel";
import { TagQuery, QueryResult } from "../../types/QueryTypes";
import { TagFilter } from "../../types/FilterTypes";
import { ParseConnection } from "./ParseConnection";

interface ParseTagRecord {
    objectId: string;
    name?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ParseTagRepository implements ITagRepository {
    async getTag(id: string): Promise<TagModel | null> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/tag`, {
                headers: connection.headers,
                params: {
                    where: JSON.stringify({ objectId: id }),
                    limit: 1,
                },
            });

            const tagData: ParseTagRecord | undefined =
                response.data?.results?.[0];
            if (!tagData) {
                return null;
            }

            return this.convertParseTagToModel(tagData);
        } catch (error) {
            console.error("Error retrieving tag by ID:", error);
            return null;
        }
    }

    async getTagByName(name: string): Promise<TagModel | null> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/tag`, {
                headers: connection.headers,
                params: {
                    where: JSON.stringify({ name }),
                    limit: 1,
                },
            });

            const tagData: ParseTagRecord | undefined =
                response.data?.results?.[0];
            if (!tagData) {
                return null;
            }

            return this.convertParseTagToModel(tagData);
        } catch (error) {
            console.error("Error retrieving tag by name:", error);
            return null;
        }
    }

    async getTags(query?: TagQuery): Promise<QueryResult<TagModel>> {
        const connection = ParseConnection.getConnection();

        try {
            const params = this.buildQueryParams(query);
            const response = await axios.get(`${connection.url}classes/tag`, {
                headers: connection.headers,
                params,
            });

            const parseTags: ParseTagRecord[] = response.data?.results ?? [];
            const tagModels = parseTags.map((record: ParseTagRecord) =>
                this.convertParseTagToModel(record)
            );

            const totalCount = Number(response.data?.count) || tagModels.length;
            const limit = query?.pagination?.limit;

            return {
                items: tagModels,
                totalCount,
                hasMore:
                    limit !== undefined ? tagModels.length === limit : false,
            };
        } catch (error) {
            console.error("Error querying tags:", error);
            return { items: [], totalCount: 0, hasMore: false };
        }
    }

    async getTagList(): Promise<string[]> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/tag`, {
                headers: connection.headers,
                params: {
                    limit: Number.MAX_SAFE_INTEGER,
                    order: "name",
                    keys: "name",
                    count: 1,
                },
            });

            return (response.data?.results ?? []).map(
                (record: ParseTagRecord) => record.name ?? ""
            );
        } catch (error) {
            console.error("Error retrieving tag list:", error);
            return [];
        }
    }

    async getTopicList(): Promise<any[]> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/tag`, {
                headers: connection.headers,
                params: {
                    where: {
                        name: {
                            $regex: "^topic:",
                            $options: "i",
                        },
                    },
                    keys: "name,category,objectId",
                    limit: 1000,
                    order: "name",
                },
            });

            return response.data?.results ?? [];
        } catch (error) {
            console.error("Error retrieving topic list:", error);
            return [];
        }
    }

    validateTag(tagName: string): boolean {
        if (!tagName) {
            return false;
        }

        const normalized = tagName.trim();
        if (normalized.length === 0) {
            return false;
        }

        // Allow alphanumeric, colon separators, dash and space after colon.
        return /^[^\s:]+(?::[^\s]+)?$/i.test(normalized);
    }

    processTagsForBook(tags: string[]): string[] {
        const normalized = tags
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0 && this.validateTag(tag));

        return Array.from(new Set(normalized));
    }

    private convertParseTagToModel(record: ParseTagRecord): TagModel {
        return new TagModel({
            objectId: record.objectId,
            name: record.name ?? "",
            category: record.category,
            createdAt: record.createdAt ?? new Date().toISOString(),
            updatedAt: record.updatedAt ?? new Date().toISOString(),
        });
    }

    private buildQueryParams(query?: TagQuery): Record<string, unknown> {
        const params: Record<string, unknown> = {
            count: 1,
        };

        if (!query) {
            params.order = "name";
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

        const where = this.buildTagFilter(query.filter);
        if (Object.keys(where).length > 0) {
            params.where = JSON.stringify(where);
        }

        if (query.orderBy) {
            params.order = `${query.orderDescending ? "-" : ""}${
                query.orderBy
            }`;
        } else {
            params.order = "name";
        }

        return params;
    }

    private buildTagFilter(filter?: TagFilter): Record<string, unknown> {
        const where: Record<string, unknown> = {};

        if (!filter) {
            return where;
        }

        if (filter.name) {
            where.name = filter.name;
        }

        if (filter.category) {
            where.category = filter.category;
        }

        return where;
    }
}

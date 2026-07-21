import {
    ITagRepository,
    TopicTagRecord,
} from "../../interfaces/ITagRepository";
import { TagModel } from "../../models/TagModel";
import { TagQuery, QueryResult } from "../../types/QueryTypes";
import { TagFilter } from "FilterTypes";
import { SupabaseConnection } from "./SupabaseConnection";

interface SupabaseTagRecord {
    id: string;
    name?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

// Note: unlike the Parse `tag` class, the Supabase `tags` table has no
// `category` column, so TagModel.category is always left undefined here.
export class SupabaseTagRepository implements ITagRepository {
    async getTag(id: string): Promise<TagModel | null> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("tags")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (error) {
                console.error("Error retrieving tag by ID:", error);
                return null;
            }
            if (!data) {
                return null;
            }
            return this.convertToModel(data);
        } catch (error) {
            console.error("Error retrieving tag by ID:", error);
            return null;
        }
    }

    async getTagByName(name: string): Promise<TagModel | null> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("tags")
                .select("*")
                .eq("name", name)
                .maybeSingle();

            if (error) {
                console.error("Error retrieving tag by name:", error);
                return null;
            }
            if (!data) {
                return null;
            }
            return this.convertToModel(data);
        } catch (error) {
            console.error("Error retrieving tag by name:", error);
            return null;
        }
    }

    async getTags(query?: TagQuery): Promise<QueryResult<TagModel>> {
        const client = SupabaseConnection.getClient();
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let q: any = client.from("tags").select("*", { count: "exact" });
            q = this.applyTagFilter(q, query?.filter);
            q = q.order("name", {
                ascending: !(query?.orderDescending ?? false),
            });

            if (query?.pagination?.limit !== undefined) {
                const skip = query.pagination.skip ?? 0;
                q = q.range(skip, skip + query.pagination.limit - 1);
            }

            const { data, error, count } = await q;
            if (error) {
                throw error;
            }

            const tagModels = (data ?? []).map((record: SupabaseTagRecord) =>
                this.convertToModel(record)
            );
            const limit = query?.pagination?.limit;

            return {
                items: tagModels,
                totalCount: count ?? tagModels.length,
                hasMore:
                    limit !== undefined ? tagModels.length === limit : false,
            };
        } catch (error) {
            console.error("Error querying tags:", error);
            return { items: [], totalCount: 0, hasMore: false };
        }
    }

    async getTagList(): Promise<string[]> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("tags")
                .select("name")
                .order("name");

            if (error) {
                console.error("Error retrieving tag list:", error);
                return [];
            }
            return (data ?? []).map(
                (record: { name: string | null }) => record.name ?? ""
            );
        } catch (error) {
            console.error("Error retrieving tag list:", error);
            return [];
        }
    }

    async getTopicList(): Promise<TopicTagRecord[]> {
        const client = SupabaseConnection.getClient();
        try {
            const { data, error } = await client
                .from("tags")
                .select("id,name")
                .ilike("name", "topic:%")
                .order("name");

            if (error) {
                console.error("Error retrieving topic list:", error);
                return [];
            }

            return (data ?? []).map((record: SupabaseTagRecord) => ({
                objectId: record.id,
                name: record.name ?? "",
                category: undefined,
            }));
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
        return /^[^\s:]+(?::[^\s]+)?$/i.test(normalized);
    }

    processTagsForBook(tags: string[]): string[] {
        const normalized = tags
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0 && this.validateTag(tag));
        return Array.from(new Set(normalized));
    }

    private convertToModel(record: SupabaseTagRecord): TagModel {
        return new TagModel({
            objectId: record.id,
            name: record.name ?? "",
            category: undefined,
            createdAt: record.created_at ?? new Date().toISOString(),
            updatedAt: record.updated_at ?? new Date().toISOString(),
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private applyTagFilter(query: any, filter?: TagFilter): any {
        let q = query;
        if (!filter) {
            return q;
        }
        if (filter.name) {
            q = q.eq("name", filter.name);
        }
        // filter.category is accepted for interface compatibility but has no
        // corresponding column to filter on (see class-level note).
        return q;
    }
}

// Repository interface for tag-related operations
import { TagQuery, QueryResult } from "../types/QueryTypes";
import { TagFilter } from "../types/FilterTypes";

// Forward declaration - will be implemented in models
export interface TagModel {
    objectId: string;
    name: string;
    category?: string;
}

export interface ITagRepository {
    // Basic CRUD operations
    getTag(id: string): Promise<TagModel | null>;
    getTagByName(name: string): Promise<TagModel | null>;
    getTags(query?: TagQuery): Promise<QueryResult<TagModel>>;

    // Specialized operations from current codebase
    getTagList(): Promise<string[]>;
    getTopicList(): Promise<any[]>; // Will type properly later

    // Tag validation and processing
    validateTag(tagName: string): boolean;
    processTagsForBook(tags: string[]): string[];
}

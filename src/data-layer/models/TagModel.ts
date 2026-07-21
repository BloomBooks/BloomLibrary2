// Business domain model for Tag entity
import { CommonEntityFields } from "../types/CommonTypes";

export class TagModel implements CommonEntityFields {
    public objectId: string = "";
    public createdAt: string = "";
    public updatedAt: string = "";

    // Tag-specific fields
    public name: string = "";
    public category?: string;

    constructor(data?: Partial<TagModel>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Business methods
    public isTopicTag(): boolean {
        return this.name.startsWith("topic:");
    }

    public isSystemTag(): boolean {
        return this.name.startsWith("system:");
    }

    public isLevelTag(): boolean {
        return this.name.startsWith("level:");
    }

    public getTagValue(): string | undefined {
        const parts = this.name.split(":");
        return parts.length > 1 ? parts[1].trim() : undefined;
    }

    public static createFromName(name: string): TagModel {
        const tag = new TagModel();
        tag.name = name;
        tag.objectId = name; // Simple ID for now
        return tag;
    }
}

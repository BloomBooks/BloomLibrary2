// Business domain model for Language entity
import { CommonEntityFields } from "../types/CommonTypes";

export class LanguageModel implements CommonEntityFields {
    public objectId: string = "";
    public createdAt: string = "";
    public updatedAt: string = "";

    // Language-specific fields
    public name: string = "";
    public isoCode: string = "";
    public usageCount: number = 0;
    public englishName?: string;
    public bannerImageUrl?: string;

    constructor(data?: Partial<LanguageModel>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Business methods
    public getDisplayName(): string {
        return this.englishName || this.name || this.isoCode;
    }

    public hasBannerImage(): boolean {
        return !!this.bannerImageUrl;
    }
}

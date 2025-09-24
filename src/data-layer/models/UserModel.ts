// Business domain model for User entity
import { CommonEntityFields } from "../types/CommonTypes";

export interface InformEditorResult {
    // Will be typed properly when we examine the current implementation
    [key: string]: any;
}

export class UserModel implements CommonEntityFields {
    public objectId: string = "";
    public createdAt: string = "";
    public updatedAt: string = "";

    // User-specific fields
    public sessionId?: string;
    public email: string = "";
    public username: string = "";
    public moderator: boolean = false;
    public showTroubleshootingStuff: boolean = false;
    public informEditorResult?: InformEditorResult;

    constructor(data?: Partial<UserModel>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Business methods
    public isModerator(): boolean {
        return this.moderator === true;
    }

    public canShowTroubleshooting(): boolean {
        return this.showTroubleshootingStuff === true;
    }

    public getDisplayName(): string {
        return this.username || this.email;
    }
}

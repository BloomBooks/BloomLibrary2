// Repository interface for user-related operations
import { UserQuery } from "../types/QueryTypes";
import { UserFilter } from "FilterTypes";

// Forward declaration - will be implemented in models
export interface UserModel {
    objectId: string;
    sessionId?: string;
    email: string;
    username: string;
    moderator: boolean;
    showTroubleshootingStuff?: boolean;
    informEditorResult?: any;
}

export interface CreateUserData {
    username: string;
    email: string;
    authData?: any;
}

export interface IUserRepository {
    // Basic CRUD operations
    getUser(id: string): Promise<UserModel | null>;
    getUserByEmail(email: string): Promise<UserModel | null>;
    createUser(userData: CreateUserData): Promise<UserModel>;
    updateUser(id: string, updates: Partial<UserModel>): Promise<void>;
    deleteUser(id: string): Promise<void>;

    // Query operations
    searchUsers(query: UserQuery): Promise<UserModel[]>;

    // Specialized operations
    checkUserIsModerator(userId: string): Promise<boolean>;
    getUserPermissions(userId: string, bookId: string): Promise<any>; // Will type properly later
}

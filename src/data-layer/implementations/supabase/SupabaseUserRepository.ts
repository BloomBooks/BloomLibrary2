// Stub Supabase implementation of IUserRepository. User read/write is an
// auth-adjacent concern that's out of scope for this migration step (which
// only covers anonymous browsing); every method throws so any accidental
// call surfaces immediately rather than silently doing the wrong thing.
import {
    BookPermissionMap,
    CreateUserData,
    IUserRepository,
} from "../../interfaces/IUserRepository";
import { UserModel } from "../../models/UserModel";
import { UserQuery } from "../../types/QueryTypes";

const NOT_IMPLEMENTED = "not implemented in Supabase data layer yet";

export class SupabaseUserRepository implements IUserRepository {
    async getUser(): Promise<UserModel | null> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async getUserByEmail(): Promise<UserModel | null> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async createUser(_userData: CreateUserData): Promise<UserModel> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async updateUser(): Promise<void> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async deleteUser(): Promise<void> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async searchUsers(_query: UserQuery): Promise<UserModel[]> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async checkUserIsModerator(): Promise<boolean> {
        throw new Error(NOT_IMPLEMENTED);
    }

    async getUserPermissions(): Promise<BookPermissionMap> {
        throw new Error(NOT_IMPLEMENTED);
    }
}

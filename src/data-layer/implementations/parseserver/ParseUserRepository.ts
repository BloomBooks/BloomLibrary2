import axios from "axios";
import {
    CreateUserData,
    IUserRepository,
} from "../../interfaces/IUserRepository";
import { InformEditorResult, UserModel } from "../../models/UserModel";
import { UserQuery } from "../../types/QueryTypes";
import { UserFilter } from "../../types/FilterTypes";
import { ParseConnection } from "./ParseConnection";
import {
    getBloomApiBooksUrl,
    getBloomApiHeaders,
} from "../../../connection/ApiConnection";

interface ParseUserRecord {
    objectId: string;
    username?: string;
    email?: string;
    sessionToken?: string;
    createdAt?: string;
    updatedAt?: string;
    informEditorResult?: unknown;
}

interface ParseModeratorRecord {
    user?: {
        objectId: string;
    };
}

export class ParseUserRepository implements IUserRepository {
    async getUser(id: string): Promise<UserModel | null> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/_User`, {
                headers: connection.headers,
                params: {
                    where: { objectId: id },
                    limit: 1,
                },
            });

            const userData: ParseUserRecord | undefined =
                response.data?.results?.[0];
            if (!userData) {
                return null;
            }

            const userModel = this.convertParseUserToModel(userData);
            userModel.moderator = await this.checkUserIsModerator(id);
            return userModel;
        } catch (error) {
            console.error("Error getting user by ID:", error);
            return null;
        }
    }

    async getUserByEmail(email: string): Promise<UserModel | null> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(`${connection.url}classes/_User`, {
                headers: connection.headers,
                params: {
                    where: { email },
                    limit: 1,
                },
            });

            const userData: ParseUserRecord | undefined =
                response.data?.results?.[0];
            if (!userData) {
                return null;
            }

            const userModel = this.convertParseUserToModel(userData);
            userModel.moderator = await this.checkUserIsModerator(
                userModel.objectId
            );
            return userModel;
        } catch (error) {
            console.error("Error getting user by email:", error);
            return null;
        }
    }

    async createUser(userData: CreateUserData): Promise<UserModel> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.post(
                `${connection.url}users`,
                {
                    username: userData.username,
                    email: userData.email,
                    authData: userData.authData,
                },
                {
                    headers: connection.headers,
                }
            );

            const parseUser: ParseUserRecord = {
                objectId: response.data.objectId,
                username: userData.username,
                email: userData.email,
                sessionToken: response.data.sessionToken,
                createdAt: response.data.createdAt,
                updatedAt: response.data.createdAt,
            };

            return this.convertParseUserToModel(parseUser);
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }

    async updateUser(id: string, updates: Partial<UserModel>): Promise<void> {
        const connection = ParseConnection.getConnection();

        try {
            await axios.put(
                `${connection.url}users/${id}`,
                this.convertUserModelToParse(updates),
                {
                    headers: connection.headers,
                }
            );
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    async deleteUser(id: string): Promise<void> {
        const connection = ParseConnection.getConnection();

        try {
            await axios.delete(`${connection.url}users/${id}`, {
                headers: connection.headers,
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }

    async searchUsers(query: UserQuery): Promise<UserModel[]> {
        const connection = ParseConnection.getConnection();

        try {
            const params = this.buildSearchParams(query);

            const response = await axios.get(`${connection.url}classes/_User`, {
                headers: connection.headers,
                params,
            });

            const parseUsers: ParseUserRecord[] = response.data?.results ?? [];
            const userModels = parseUsers.map((user) =>
                this.convertParseUserToModel(user)
            );

            if (query.filter?.moderator !== undefined) {
                const moderatorIds = await this.getModeratorUserIds();
                return userModels
                    .map((user) => {
                        user.moderator = moderatorIds.has(user.objectId);
                        return user;
                    })
                    .filter((user) =>
                        query.filter?.moderator
                            ? user.moderator
                            : !user.moderator
                    );
            }

            return userModels;
        } catch (error) {
            console.error("Error searching users:", error);
            return [];
        }
    }

    async checkUserIsModerator(userId: string): Promise<boolean> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(
                `${connection.url}classes/moderators`,
                {
                    headers: connection.headers,
                    params: {
                        where: {
                            user: {
                                __type: "Pointer",
                                className: "_User",
                                objectId: userId,
                            },
                        },
                        limit: 1,
                    },
                }
            );

            return (response.data?.results?.length ?? 0) > 0;
        } catch (error) {
            console.error("Error checking moderator status:", error);
            return false;
        }
    }

    async getUserPermissions(userId: string, bookId: string): Promise<any> {
        try {
            const response = await axios.get(
                getBloomApiBooksUrl(bookId, "permissions"),
                {
                    headers: getBloomApiHeaders(),
                    params: userId ? { userId } : undefined,
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error getting user permissions:", error);
            throw error;
        }
    }

    private convertParseUserToModel(user: ParseUserRecord): UserModel {
        return new UserModel({
            objectId: user.objectId,
            username: user.username ?? "",
            email: user.email ?? "",
            sessionId: user.sessionToken,
            createdAt: user.createdAt ?? new Date().toISOString(),
            updatedAt: user.updatedAt ?? new Date().toISOString(),
            informEditorResult: user.informEditorResult as
                | InformEditorResult
                | undefined,
            moderator: false,
        });
    }

    private convertUserModelToParse(
        user: Partial<UserModel>
    ): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        if (user.username !== undefined) {
            result.username = user.username;
        }
        if (user.email !== undefined) {
            result.email = user.email;
        }
        if (user.sessionId !== undefined) {
            result.sessionToken = user.sessionId;
        }
        if (user.informEditorResult !== undefined) {
            result.informEditorResult = user.informEditorResult;
        }

        return result;
    }

    private buildSearchParams(query: UserQuery): Record<string, unknown> {
        const params: Record<string, unknown> = {
            order: "-createdAt",
        };

        if (query.pagination?.limit !== undefined) {
            params.limit = query.pagination.limit;
        }
        if (query.pagination?.skip !== undefined) {
            params.skip = query.pagination.skip;
        }
        if (query.fieldSelection?.length) {
            params.keys = query.fieldSelection.join(",");
        }

        const where = this.buildUserFilter(query.filter);
        if (Object.keys(where).length > 0) {
            params.where = where;
        }

        return params;
    }

    private buildUserFilter(filter?: UserFilter): Record<string, unknown> {
        const where: Record<string, unknown> = {};

        if (!filter) {
            return where;
        }

        if (filter.email) {
            where.email = filter.email;
        }

        if (filter.username) {
            where.username = filter.username;
        }

        return where;
    }

    private async getModeratorUserIds(): Promise<Set<string>> {
        const connection = ParseConnection.getConnection();

        try {
            const response = await axios.get(
                `${connection.url}classes/moderators`,
                {
                    headers: connection.headers,
                    params: {
                        keys: "user",
                        limit: 1000,
                        include: "user",
                    },
                }
            );

            const moderatorIds = (response.data?.results ?? [])
                .map((record: ParseModeratorRecord) =>
                    record.user?.objectId ? record.user.objectId : undefined
                )
                .filter((id: string | undefined): id is string => !!id);

            return new Set<string>(moderatorIds);
        } catch (error) {
            console.error("Error retrieving moderator list:", error);
            return new Set<string>();
        }
    }
}

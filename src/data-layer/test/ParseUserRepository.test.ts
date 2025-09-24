import axios from "axios";
import type { AxiosStatic } from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Mocked } from "vitest";
import type {
    CreateUserData,
    IUserRepository,
} from "../interfaces/IUserRepository";
import { ParseUserRepository } from "../implementations/parseserver/ParseUserRepository";
import { ParseConnection } from "../implementations/parseserver/ParseConnection";

vi.mock("axios");

const mockedAxios = (axios as unknown) as Mocked<AxiosStatic>;

describe("ParseUserRepository", () => {
    let repository: IUserRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        ParseConnection.reset();
        repository = new ParseUserRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
        ParseConnection.reset();
    });

    it("fetches a user with moderator flag populated", async () => {
        const iso = new Date().toISOString();
        mockedAxios.get
            .mockResolvedValueOnce({
                data: {
                    results: [
                        {
                            objectId: "user1",
                            username: "User One",
                            email: "user1@example.com",
                            sessionToken: "session-token",
                            createdAt: iso,
                            updatedAt: iso,
                        },
                    ],
                },
            })
            .mockResolvedValueOnce({
                data: {
                    results: [{ user: { objectId: "user1" } }],
                },
            });

        const user = await repository.getUser("user1");

        expect(user).not.toBeNull();
        expect(user?.objectId).toBe("user1");
        expect(user?.moderator).toBe(true);
        expect(mockedAxios.get).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("classes/_User"),
            expect.anything()
        );
    });

    it("creates a new user", async () => {
        const iso = new Date().toISOString();
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                objectId: "user2",
                sessionToken: "session-2",
                createdAt: iso,
            },
        });

        const userData: CreateUserData = {
            username: "new-user",
            email: "new@example.com",
        };

        const user = await repository.createUser(userData);

        expect(user.objectId).toBe("user2");
        expect(user.username).toBe("new-user");
        expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining("users"),
            expect.objectContaining({
                username: "new-user",
                email: "new@example.com",
            }),
            expect.anything()
        );
    });

    it("updates a user", async () => {
        mockedAxios.put.mockResolvedValueOnce({});

        await repository.updateUser("user1", { username: "updated" });

        expect(mockedAxios.put).toHaveBeenCalledWith(
            expect.stringContaining("users/user1"),
            expect.objectContaining({ username: "updated" }),
            expect.anything()
        );
    });

    it("deletes a user", async () => {
        mockedAxios.delete.mockResolvedValueOnce({});

        await repository.deleteUser("user1");

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            expect.stringContaining("users/user1"),
            expect.anything()
        );
    });

    it("filters moderators when requested", async () => {
        mockedAxios.get
            .mockResolvedValueOnce({
                data: {
                    results: [
                        {
                            objectId: "mod1",
                            username: "Mod",
                            email: "mod@example.com",
                        },
                        {
                            objectId: "user2",
                            username: "User",
                            email: "user2@example.com",
                        },
                    ],
                },
            })
            .mockResolvedValueOnce({
                data: {
                    results: [{ user: { objectId: "mod1" } }],
                },
            });

        const users = await repository.searchUsers({
            filter: { moderator: true },
            pagination: { limit: 10, skip: 0 },
        });

        expect(users).toHaveLength(1);
        expect(users[0].objectId).toBe("mod1");
        expect(users[0].moderator).toBe(true);
    });

    it("retrieves user permissions for a book", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                editSurfaceMetadata: true,
                delete: false,
            },
        });

        const permissions = await repository.getUserPermissions(
            "user1",
            "book1"
        );

        expect(mockedAxios.get).toHaveBeenLastCalledWith(
            expect.stringContaining("/books/book1:permissions"),
            expect.objectContaining({
                headers: expect.anything(),
            })
        );
        expect(permissions.editSurfaceMetadata).toBe(true);
    });
});

import axios from "axios";
import type { AxiosStatic } from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Mocked } from "vitest";
import type { IAuthenticationService } from "../interfaces/IAuthenticationService";
import { ParseAuthenticationService } from "../implementations/parseserver/ParseAuthenticationService";
import { ParseConnection } from "../implementations/parseserver/ParseConnection";
import { LoggedInUser, User } from "../../connection/LoggedInUser";
import { UserModel } from "../models/UserModel";
import { ParseUserRepository } from "../implementations/parseserver/ParseUserRepository";

vi.mock("axios");
vi.mock("@sentry/browser", () => ({
    captureException: vi.fn(),
}));
vi.mock("../../editor", () => ({
    informEditorOfSuccessfulLogin: vi.fn(),
    isForEditor: vi.fn(() => false),
}));

const mockedAxios = (axios as unknown) as Mocked<AxiosStatic>;

describe("ParseAuthenticationService", () => {
    let service: IAuthenticationService;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, "alert").mockImplementation(() => {});
        ParseConnection.reset();
        LoggedInUser.current = undefined;
        service = new ParseAuthenticationService();
    });

    afterEach(() => {
        vi.resetAllMocks();
        ParseConnection.reset();
        LoggedInUser.current = undefined;
    });

    it("connects a user, sets session, and notifies listeners", async () => {
        const iso = new Date().toISOString();
        mockedAxios.post
            .mockResolvedValueOnce({ data: {} })
            .mockResolvedValueOnce({
                data: {
                    objectId: "user1",
                    username: "User One",
                    email: "user1@example.com",
                    sessionToken: "session-token",
                    sessionId: "session-token",
                    createdAt: iso,
                    updatedAt: iso,
                },
            });

        const checkModeratorSpy = vi
            .spyOn(ParseUserRepository.prototype, "checkUserIsModerator")
            .mockResolvedValue(true);

        const listener = vi.fn();
        service.onAuthStateChanged(listener);

        const user = await service.connectUser("jwt-token", "user1");

        expect(mockedAxios.post).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("functions/bloomLink"),
            { token: "jwt-token", id: "user1" },
            expect.any(Object)
        );
        expect(mockedAxios.post).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("users"),
            expect.objectContaining({
                authData: expect.any(Object),
                username: "user1",
            }),
            expect.any(Object)
        );
        expect(checkModeratorSpy).toHaveBeenCalledWith("user1");
        expect(user.objectId).toBe("user1");
        expect(service.getSessionToken()).toBe("session-token");
        expect(service.hasValidSession()).toBe(true);
        expect(LoggedInUser.current?.objectId).toBe("user1");
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({ objectId: "user1" })
        );
    });

    it("clears session and state when logging out", async () => {
        const user = new User({
            objectId: "user1",
            sessionId: "session-token",
            email: "user1@example.com",
            username: "User One",
            moderator: false,
        });
        LoggedInUser.current = user;
        ParseConnection.setSessionToken("session-token");
        mockedAxios.post.mockResolvedValueOnce({ data: {} });

        const listener = vi.fn();
        service.onAuthStateChanged(listener);

        await service.logout();

        expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining("logout"),
            null,
            expect.any(Object)
        );
        expect(service.hasValidSession()).toBe(false);
        expect(ParseConnection.getSessionToken()).toBeUndefined();
        expect(LoggedInUser.current).toBeUndefined();
        expect(listener).toHaveBeenCalledWith(undefined);
    });

    it("sets and clears current user manually", () => {
        const listener = vi.fn();
        const unsubscribe = service.onAuthStateChanged(listener);

        const userModel = new UserModel({
            objectId: "user1",
            username: "User One",
            email: "user1@example.com",
            sessionId: "session-token",
            moderator: true,
            showTroubleshootingStuff: true,
        });

        service.setCurrentUser(userModel);

        expect(ParseConnection.getSessionToken()).toBe("session-token");
        expect(LoggedInUser.current?.username).toBe("User One");
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({ objectId: "user1" })
        );

        listener.mockClear();
        service.setCurrentUser(undefined);

        expect(ParseConnection.getSessionToken()).toBeUndefined();
        expect(LoggedInUser.current).toBeUndefined();
        expect(listener).toHaveBeenCalledWith(undefined);

        unsubscribe();
    });

    it("returns current user model snapshot", () => {
        const user = new User({
            objectId: "user1",
            sessionId: "session-token",
            email: "user1@example.com",
            username: "User One",
            moderator: true,
        });
        user.showTroubleshootingStuff = true;
        LoggedInUser.current = user;
        ParseConnection.setSessionToken("session-token");

        const current = service.getCurrentUser();

        expect(current?.objectId).toBe("user1");
        expect(current?.sessionId).toBe("session-token");
        expect(current?.showTroubleshootingStuff).toBe(true);
    });

    it("sends concern email via cloud function", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: {} });

        await service.sendConcernEmail("me@example.com", "Concern", "book1");

        expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining("functions/sendConcernEmail"),
            {
                fromAddress: "me@example.com",
                content: "Concern",
                bookId: "book1",
            },
            expect.any(Object)
        );
    });
});

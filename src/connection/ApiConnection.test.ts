import { describe, it, expect, vi, beforeEach } from "vitest";

// getBloomApiHeaders must read the Parse session token from the ACTIVE
// data-layer authentication service, where the real login flow stores it (via
// ParseConnection.setSessionToken). We mock the data-layer index so this stays a
// focused unit test and doesn't drag the whole factory/registration into scope.
const getSessionTokenMock = vi.fn<() => string | undefined>();

vi.mock("../data-layer", () => ({
    getAuthenticationService: () => ({
        getSessionToken: getSessionTokenMock,
    }),
}));

import { getBloomApiHeaders } from "./ApiConnection";

describe("getBloomApiHeaders", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("includes the Authentication-Token header when a session token is present", () => {
        getSessionTokenMock.mockReturnValue("session-token-123");

        const headers = getBloomApiHeaders();

        expect(headers).toEqual({
            "Authentication-Token": "session-token-123",
        });
    });

    it("omits the Authentication-Token header when there is no session token", () => {
        getSessionTokenMock.mockReturnValue(undefined);

        const headers = getBloomApiHeaders();

        expect(headers).toEqual({});
        expect("Authentication-Token" in headers).toBe(false);
    });
});

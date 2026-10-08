import axios from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { connectParseServer, getConnection } from "./ParseServerConnection";
import { LoggedInUser } from "./LoggedInUser";
import { informEditorOfSuccessfulLogin, isForEditor } from "../editor";

vi.mock("axios");
vi.mock("@sentry/browser", () => ({ captureException: vi.fn() }));
vi.mock("../editor", () => ({
    isForEditor: vi.fn(() => false),
    informEditorOfSuccessfulLogin: vi.fn(),
}));

const mockedPost = vi.mocked(axios.post);
const email = "someone@example.com";

// Stands in for parse-server 8's POST to users (BL-17000):
// - a request that carries a session token is treated as the current user re-linking authData,
//   and no new sessionToken comes back;
// - when the request creates the user (201), the reply has only objectId, createdAt and
//   sessionToken, not the email or username we sent.
// If holdBloomLink is set, each bloomLink call waits until the test calls the release
// function it pushes onto bloomLinkReleases, so a test can interleave logins.
function fakeParseServer(options: {
    userExists: boolean;
    holdBloomLink?: boolean;
}) {
    let sessionCount = 0;
    let userExists = options.userExists;
    const sessionTokensSent: Array<string | undefined> = [];
    const bloomLinkReleases: Array<() => void> = [];
    mockedPost.mockImplementation(async (url: string, _data, config) => {
        // Copy the value now, in case the headers object changes after the call.
        const sessionToken = (config?.headers as any)?.[
            "X-Parse-Session-Token"
        ];
        sessionTokensSent.push(sessionToken);
        if (url.endsWith("functions/bloomLink")) {
            if (options.holdBloomLink) {
                await new Promise<void>((release) =>
                    bloomLinkReleases.push(release)
                );
            }
            return { data: {} };
        }
        if (!userExists) {
            userExists = true;
            sessionCount++;
            return {
                status: 201,
                data: {
                    objectId: "user1",
                    createdAt: "2026-10-08T00:00:00.000Z",
                    sessionToken: `r:${sessionCount}`,
                },
            };
        }
        const user = { objectId: "user1", email, username: email };
        if (sessionToken) {
            return { status: 200, data: user };
        }
        sessionCount++;
        return {
            status: 200,
            data: { ...user, sessionToken: `r:${sessionCount}` },
        };
    });
    return { sessionTokensSent, bloomLinkReleases };
}

// Let pending promise callbacks (the mocked requests and their .then handlers) run.
const settle = () => new Promise((r) => setTimeout(r, 0));

describe("connectParseServer", () => {
    let alertSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        mockedPost.mockReset();
        vi.mocked(axios.get).mockResolvedValue({ data: { results: [] } });
        vi.mocked(isForEditor).mockReturnValue(false);
        vi.mocked(informEditorOfSuccessfulLogin).mockClear();
        delete getConnection().headers["X-Parse-Session-Token"];
        LoggedInUser.current = undefined;
        alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
        alertSpy.mockRestore();
    });

    it("succeeds when logging in a second time without reloading the page", async () => {
        const { sessionTokensSent } = fakeParseServer({ userExists: true });

        await connectParseServer("jwt1", email);
        expect(getConnection().headers["X-Parse-Session-Token"]).toBe("r:1");

        const second = await connectParseServer("jwt2", email);

        expect(second.sessionToken).toBe("r:2");
        expect(getConnection().headers["X-Parse-Session-Token"]).toBe("r:2");
        // Neither login's bloomLink or users call carried a session token.
        expect(sessionTokensSent).toEqual([
            undefined,
            undefined,
            undefined,
            undefined,
        ]);
        expect(alertSpy).not.toHaveBeenCalled();
    });

    it("succeeds and tells Bloom the email when the login creates the user", async () => {
        vi.mocked(isForEditor).mockReturnValue(true);
        fakeParseServer({ userExists: false });

        const result = await connectParseServer("jwt1", email, null);

        expect(result.sessionToken).toBe("r:1");
        expect(LoggedInUser.current?.email).toBe(email);
        expect(LoggedInUser.current?.username).toBe(email);
        expect(LoggedInUser.current?.objectId).toBe("user1");
        expect(informEditorOfSuccessfulLogin).toHaveBeenCalledWith(
            expect.objectContaining({
                email,
                sessionToken: "r:1",
                objectId: "user1",
            }),
            null
        );
        expect(alertSpy).not.toHaveBeenCalled();
    });

    it("succeeds when a second login starts before the first one finishes", async () => {
        const { sessionTokensSent, bloomLinkReleases } = fakeParseServer({
            userExists: true,
            holdBloomLink: true,
        });

        const first = connectParseServer("jwt1", email);
        const second = connectParseServer("jwt2", email);
        await settle();
        expect(bloomLinkReleases.length).toBe(2);

        // The first login finishes completely while the second waits on bloomLink...
        bloomLinkReleases[0]();
        expect((await first).sessionToken).toBe("r:1");
        expect(getConnection().headers["X-Parse-Session-Token"]).toBe("r:1");

        // ...and the second must not send the first one's new session token.
        bloomLinkReleases[1]();
        expect((await second).sessionToken).toBe("r:2");
        expect(getConnection().headers["X-Parse-Session-Token"]).toBe("r:2");
        expect(sessionTokensSent).toEqual([
            undefined,
            undefined,
            undefined,
            undefined,
        ]);
        expect(alertSpy).not.toHaveBeenCalled();
    });
});

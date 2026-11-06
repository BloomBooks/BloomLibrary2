import { describe, it, expect, vi, beforeEach } from "vitest";
import axios, { AxiosError } from "axios";

const captured: Array<{
    message: string;
    tags: Record<string, string>;
    extras: Record<string, unknown>;
}> = [];

vi.mock("@sentry/browser", () => ({
    withScope: (callback: (scope: unknown) => void) => {
        const tags: Record<string, string> = {};
        const extras: Record<string, unknown> = {};
        callback({
            setTag: (k: string, v: string) => (tags[k] = v),
            setExtra: (k: string, v: unknown) => (extras[k] = v),
        });
        (captured[captured.length - 1] as any).tags = tags;
        (captured[captured.length - 1] as any).extras = extras;
    },
    captureException: (e: Error) =>
        captured.push({ message: e.message, tags: {}, extras: {} }),
}));

import {
    reportIfServerError,
    reportServerErrorsToSentry,
    forgetReportedServerErrors,
} from "./ReportServerErrors";

function makeError(status: number | undefined, data?: unknown): AxiosError {
    return {
        config: {
            url: "https://server.bloomlibrary.org/parse/classes/books",
            method: "get",
            params: { where: '{"$or":[]}', count: 1 },
            headers: { "X-Parse-Session-Token": "secret" },
        },
        response:
            status === undefined
                ? undefined
                : ({ status, data } as AxiosError["response"]),
        isAxiosError: true,
        name: "Error",
        message: "Request failed",
        toJSON: () => ({}),
    } as AxiosError;
}

describe("reportIfServerError", () => {
    beforeEach(() => {
        captured.length = 0;
        forgetReportedServerErrors();
    });

    it("reports a 500 with the server's message, path and query", () => {
        const reported = reportIfServerError(
            makeError(500, {
                code: 1,
                error: "$or argument must be a non-empty array",
            })
        );
        expect(reported).toBe(true);
        expect(captured).toHaveLength(1);
        expect(captured[0].message).toBe(
            "Server error 500 from GET server.bloomlibrary.org/parse/classes/books: $or argument must be a non-empty array"
        );
        expect(captured[0].tags.serverErrorStatus).toBe("500");
        expect(captured[0].extras.params).toContain('{\\"$or\\":[]}');
    });

    it("never sends the session token", () => {
        reportIfServerError(makeError(500, { error: "boom" }));
        expect(JSON.stringify(captured)).not.toContain("secret");
    });

    it("reports the same failure only once per page load", () => {
        reportIfServerError(makeError(500, { error: "boom" }));
        reportIfServerError(makeError(500, { error: "boom" }));
        reportIfServerError(makeError(502, { error: "boom" }));
        expect(captured.map((c) => c.message)).toEqual([
            "Server error 500 from GET server.bloomlibrary.org/parse/classes/books: boom",
            "Server error 502 from GET server.bloomlibrary.org/parse/classes/books: boom",
        ]);
    });

    it("ignores client errors and failures with no response", () => {
        expect(reportIfServerError(makeError(404, { error: "nope" }))).toBe(
            false
        );
        expect(reportIfServerError(makeError(undefined))).toBe(false);
        expect(captured).toHaveLength(0);
    });

    it("leaves the caller's error unchanged when installed as an interceptor", async () => {
        const instance = axios.create();
        reportServerErrorsToSentry(instance);
        const error = makeError(503, "Service Unavailable");
        instance.defaults.adapter = () => Promise.reject(error);
        await expect(instance.get("/anything")).rejects.toBe(error);
        expect(captured.map((c) => c.message)).toEqual([
            "Server error 503 from GET server.bloomlibrary.org/parse/classes/books: Service Unavailable",
        ]);
    });
});

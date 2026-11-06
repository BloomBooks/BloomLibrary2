import { AxiosError } from "axios";
import * as Sentry from "@sentry/browser";

// Most of the site's queries go through @use-hooks/axios, which on failure just hands the
// component an error, and most components then show nothing. So a query the server rejects
// fails silently: in BL-17086 the Parse server rejected about 750 queries a day for years
// and nobody noticed until someone read its log. This reports every server error (5xx) a
// request gets to Sentry, so a broken query shows up there instead.
//
// We report each distinct failure once per page load. A broken query typically repeats on
// every page that uses it, and Sentry counts users and sessions for us anyway.

const alreadyReported = new Set<string>();

// Just the part of an axios instance we use. @use-hooks/axios carries its own copy of axios,
// with typings from a slightly different version, so we can't name AxiosInstance here.
interface IHasResponseInterceptors {
    interceptors: {
        response: {
            use(
                onFulfilled: undefined,
                onRejected: (error: any) => any
            ): number;
        };
    };
}

export function reportServerErrorsToSentry(instance: IHasResponseInterceptors) {
    instance.interceptors.response.use(undefined, (error: AxiosError) => {
        try {
            reportIfServerError(error);
        } catch (e) {
            // Reporting must never change what the caller sees.
            console.error(e);
        }
        return Promise.reject(error);
    });
}

export function reportIfServerError(error: AxiosError): boolean {
    const status = error?.response?.status;
    // No response means offline, cancelled, CORS and so on: the user's network, not our server.
    // 4xx are often expected (e.g. "object not found") and are handled by the callers.
    if (!status || status < 500) return false;

    const path = getPath(error.config?.url, error.config?.baseURL);
    const serverMessage = getServerMessage(error.response?.data);
    const method = (error.config?.method || "get").toUpperCase();
    const summary = `Server error ${status} from ${method} ${path}${
        serverMessage ? `: ${serverMessage}` : ""
    }`;
    if (alreadyReported.has(summary)) return false;
    alreadyReported.add(summary);

    Sentry.withScope((scope) => {
        scope.setTag("serverErrorStatus", String(status));
        scope.setTag("serverErrorPath", path);
        // The query string is what we need to reproduce a failing query. We deliberately
        // send neither the headers, which carry the user's session token, nor the request
        // body, which for the login calls carries their Firebase token and email.
        scope.setExtra("params", truncate(safeStringify(error.config?.params)));
        scope.setExtra(
            "response",
            truncate(safeStringify(error.response?.data))
        );
        Sentry.captureException(new Error(summary));
    });
    return true;
}

// Only for tests.
export function forgetReportedServerErrors() {
    alreadyReported.clear();
}

// The host and path, without the query string, which can hold a long "where" clause
// and would split one problem into many Sentry issues.
function getPath(url?: string, baseURL?: string): string {
    if (!url) return "(unknown url)";
    try {
        const u = new URL(url, baseURL || window.location.href);
        return u.host + u.pathname;
    } catch {
        return url.split("?")[0];
    }
}

// Parse answers with {code, error}; the Azure functions often with a plain string.
function getServerMessage(data: unknown): string {
    if (!data) return "";
    if (typeof data === "string") return truncate(data, 200);
    const d = data as { error?: unknown; message?: unknown };
    const message = d.error ?? d.message;
    return typeof message === "string" ? truncate(message, 200) : "";
}

function safeStringify(value: unknown): string {
    if (value === undefined) return "";
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

function truncate(s: string, max = 2000): string {
    return s.length > max ? s.substring(0, max) + "…" : s;
}

import { DataSource, getDataSource } from "./DataSource";
import { getAuthenticationService } from "../data-layer";

export function getBloomApiUrl(): string {
    // Developer, if you want to test a local backend, temporarily uncomment this.
    //return "http://localhost:7071/v1";

    // NB: at the moment, this seems to work even without going through the proxy. I don't know why.
    if (window.location.hostname === "localhost") {
        // When running blorg locally, we need to use a vite proxy to handle CORS issues. (See vite.config.ts)
        return "/api/v1";
    }

    return "https://api.bloomlibrary.org/v1";
}

export function getBloomApiBooksUrl(
    bookDatabaseId: string = "",
    bookAction: string = ""
): string {
    let actionPart = "";
    if (bookAction) actionPart = `:${bookAction}`;
    return addEnvironmentParam(
        `${getBloomApiUrl()}/books/${bookDatabaseId}${actionPart}`
    );
}

function addEnvironmentParam(urlStr: string): string {
    return getDataSource() === DataSource.Dev
        ? `${urlStr}${urlStr.includes("?") ? "&" : "?"}env=dev`
        : urlStr;
}

export function getBloomApiHeaders(): Record<string, string> {
    // Resolve the auth service lazily here (inside the function, never at module
    // top level): ApiConnection is imported very widely, and the data-layer
    // index registers its implementations at import time, so touching the
    // service during this module's evaluation risks a circular-import /
    // registration-order hazard. Called at request time, the service is ready.
    //
    // The session token now lives in the active data-layer authentication
    // service (the ParseServer impl stores it in ParseConnection). Under the
    // Supabase impl getSessionToken() returns undefined, so we omit the header
    // entirely, matching anonymous behavior.
    const sessionToken = getAuthenticationService().getSessionToken();
    return sessionToken ? { "Authentication-Token": sessionToken } : {};
}

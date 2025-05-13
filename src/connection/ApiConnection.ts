import { DataSource, getDataSource } from "./DataSource";
import { getConnection } from "./ParseServerConnection";

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

export function getBloomApiHeaders() {
    return {
        "Authentication-Token": getConnection().headers[
            "X-Parse-Session-Token"
        ],
    };
}

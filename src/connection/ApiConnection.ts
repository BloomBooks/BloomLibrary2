import { DataSource, getDataSource } from "./DataSource";
import { getConnection } from "./ParseServerConnection";

export function getBloomApiUrl(): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const local = "http://localhost:7071/v1";
    const prod = "https://api.bloomlibrary.org/v1";

    // Change this to return whichever one you want your requests to go to.
    return prod;
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
    const url = new URL(urlStr);
    if (getDataSource() === DataSource.Dev) url.searchParams.set("env", "dev");
    return url.toString();
}

export function getBloomApiHeaders() {
    return {
        "Authentication-Token": getConnection().headers[
            "X-Parse-Session-Token"
        ],
    };
}

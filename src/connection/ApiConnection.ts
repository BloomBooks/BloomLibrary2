import { DataSource, getDataSource } from "./DataSource";
import { getConnection } from "./ParseServerConnection";

type ApiChoice = "prod" | "staging";

const kApiUrls: Record<ApiChoice, string> = {
    prod: "https://api.bloomlibrary.org/v1",
    staging: "https://staging-api.bloomlibrary.org/v1",
};
const kApiChoiceKey = "bloomLibraryApi";

// Testers can send this browser's API calls to staging-api.bloomlibrary.org by opening any page
// with ?api=staging, and back with ?api=prod; the choice is remembered in this browser. Staging
// runs the backend's develop branch against the same data, so a change can be tried on the real
// site before it reaches production (BL-17059). Only these two values are accepted, so a link
// can't point the site at some other server.
export function getApiChoice(
    search: string = window.location.search
): ApiChoice {
    const requested = new URLSearchParams(search).get("api");
    let choice = requested;
    try {
        if (requested === "staging") {
            localStorage.setItem(kApiChoiceKey, requested);
        } else if (requested === "prod") {
            localStorage.removeItem(kApiChoiceKey);
        }
        choice = localStorage.getItem(kApiChoiceKey);
    } catch {
        // Storage is blocked: the address alone decides, for this page load only.
    }
    return choice === "staging" ? "staging" : "prod";
}

// Worked out once, when the site loads: the choice only changes when a page is opened with ?api=.
const kApiChoice = getApiChoice();

export function getBloomApiUrl(): string {
    // Developer, if you want to test a local backend, temporarily uncomment this.
    //return "http://localhost:7071/v1";

    // NB: at the moment, this seems to work even without going through the proxy. I don't know why.
    if (window.location.hostname === "localhost") {
        // When running blorg locally, we need to use a vite proxy to handle CORS issues. (See vite.config.ts)
        return "/api/v1";
    }

    return kApiUrls[kApiChoice];
}

export function isUsingStagingApi(): boolean {
    return getBloomApiUrl() === kApiUrls.staging;
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

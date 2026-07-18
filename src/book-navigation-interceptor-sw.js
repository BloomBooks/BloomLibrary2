import { getDataSourceForHostname } from "./connection/DataSource";
import { createParseConnection } from "./connection/ParseConnectionConfig";
import {
    getUrlOfHtmlOfDigitalVersion,
    getHarvesterBaseUrlFromBaseUrl,
} from "./model/BookUrlUtils";

const bloomPlayerPath = "/bloom-player/bloomplayer.htm";

// Activate a newly installed interceptor immediately for the current read session.
self.addEventListener("install", (event) => {
    event.waitUntil(self.skipWaiting());
});

// Take control of already-open matching pages so /book/... requests are intercepted right away.
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    const requestUrl = new URL(event.request.url);
    if (event.request.method !== "GET" || !isBookContentRequest(requestUrl)) {
        return;
    }

    event.respondWith(interceptBookRequest(event));
});

function isBookContentRequest(requestUrl) {
    return !!parseBookRequest(requestUrl);
}

async function interceptBookRequest(event) {
    if (!(await requestCameFromBloomPlayer(event))) {
        return fetch(event.request);
    }
    const requestUrl = new URL(event.request.url);
    const requestInfo = parseBookRequest(requestUrl);
    if (!requestInfo) {
        console.error("Failed to parse book request URL");
        return new Response("Invalid book request URL", { status: 400 });
    }
    try {
        // enhance: better handling of cases where multiple books have the same bookInstanceId
        const query = new URLSearchParams({
            where: JSON.stringify({
                bookInstanceId: requestInfo.bookInstanceId,
                harvestState: "Done",
                inCirculation: true,
            }),
            limit: "1",
            keys: "baseUrl,harvestState,bookInstanceId",
        });
        const bookData = await retrieveBookData(query);
        if (!bookData || !bookData.baseUrl) {
            console.error("Book not found or not ready for reading", {
                bookInstanceId: requestInfo.bookInstanceId,
                harvestState: bookData?.harvestState,
                hasBaseUrl: !!bookData?.baseUrl,
            });
            return new Response("Book not found or not ready for reading", {
                status: 404,
            });
        }
        const harvesterBaseUrl = getHarvesterBaseUrlFromBaseUrl(
            bookData.baseUrl,
            self.location.hostname === "localhost"
        );
        if (!harvesterBaseUrl) {
            console.error("Failed to construct harvester base URL");
            return new Response("Failed to construct book URL", {
                status: 500,
            });
        }

        const redirectUrl = `${getUrlOfHtmlOfDigitalVersion(
            harvesterBaseUrl,
            requestInfo.filePath
        )}${requestUrl.search}`;
        // e.g. http://localhost:5174/s3/bloomharvest-sandbox/TkG1dWsW40%2f1768316502115/bloomdigital%2f${filePath}
        return Response.redirect(redirectUrl, 302);
    } catch (error) {
        console.error("Failed to redirect Bloom Player book request", error);
        return new Response("Failed to load book: " + error.message, {
            status: 500,
        });
    }
}

function parseBookRequest(requestUrl) {
    // e.g. http://localhost:5174/book/36befbb8-8201-42cc-8faa-5c9432a985dd/index.htm
    const requestPath = requestUrl.pathname.split("/book/")[1];
    if (!requestPath) {
        return undefined;
    }

    const firstSlashIndex = requestPath.indexOf("/");
    if (firstSlashIndex < 0 || firstSlashIndex === requestPath.length - 1) {
        return undefined;
    }

    return {
        bookInstanceId: decodeURIComponent(
            requestPath.substring(0, firstSlashIndex)
        ),
        filePath: requestPath.substring(firstSlashIndex + 1),
    };
}

async function retrieveBookData(query) {
    // The main app caches the X-Parse-Session-Token, but as of March 2026 we don't need that in the service worker
    // anyway so we can just create a parse connection object
    const connection = createParseConnection(
        getDataSourceForHostname(self.location.hostname)
    );
    const response = await fetch(`${connection.url}classes/books?${query}`, {
        headers: connection.headers,
    });

    if (!response.ok) {
        throw new Error(`Parse lookup failed: ${response.status}`);
    }

    const data = await response.json();
    return data.results?.[0];
}

async function requestCameFromBloomPlayer(event) {
    if (event.request.referrer.includes(bloomPlayerPath)) {
        return true;
    }

    if (!event.clientId) {
        return false;
    }

    try {
        const client = await self.clients.get(event.clientId);
        if (client?.url.includes(bloomPlayerPath)) {
            return true;
        }
    } catch (error) {
        console.error(
            "Failed to inspect service worker client for book navigation interception",
            error
        );
    }

    return false;
}

import { createParseConnectionForHostname } from "./connection/ParseConnectionConfig";

const bloomPlayerPath = "/bloom-player/bloomplayer.htm";
// let parseConnection;
// const harvesterBaseUrlCache = new Map();

// Activate a newly installed interceptor immediately for the current read session.
self.addEventListener("install", (event) => {
    event.waitUntil(self.skipWaiting());
});

// Take control of already-open matching pages so /book/... requests are intercepted right away.
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

//

// self.addEventListener("message", (event) => {
//     if (event.data?.type !== "configure-read-book-interceptor") {
//         return;
//     }

//     const payload = event.data.payload;
//     if (!payload?.url) {
//         event.ports[0]?.postMessage({
//             type: "read-book-interceptor-configure-error",
//             message: "Missing Parse connection URL",
//         });
//         return;
//     }

//     parseConnection = payload;
//     harvesterBaseUrlCache.clear();
//     event.ports[0]?.postMessage({
//         type: "read-book-interceptor-configured",
//     });
// });

self.addEventListener("fetch", (event) => {
    const requestUrl = new URL(event.request.url);
    if (
        event.request.method !== "GET" ||
        !requestUrl.pathname.includes("/book/")
    ) {
        return;
    }

    event.respondWith(interceptBookRequest(event));
});

async function interceptBookRequest(event) {
    if (!(await requestCameFromBloomPlayer(event))) {
        return fetch(event.request);
    }
    const requestUrl = new URL(event.request.url);
    const requestInfo = parseBookRequest(requestUrl);
    if (!requestInfo) {
        return fetch(event.request);
    }

    console.log(
        "Request came from Bloom Player, intercepting and returning custom response"
    );

    // return Response.redirect(
    //     `http://localhost:5174/s3/bloomharvest-sandbox/TkG1dWsW40%2f1768316502115/bloomdigital%2f${filePath}`,
    //     302
    // );

    try {
        const query = constructParseBookQuery(requestInfo.bookInstanceId);
        const bookData = await retrieveBookData(query);
        const harvesterBaseUrl = getHarvesterBaseUrl(bookData);
        if (!harvesterBaseUrl) {
            return fetch(event.request);
        }

        return Response.redirect(
            `${harvesterBaseUrl}bloomdigital%2f${encodeBookFilePath(
                requestInfo.filePath
            )}${requestUrl.search}`,
            302
        );
    } catch (error) {
        console.error("Failed to redirect Bloom Player book request", error);
        return fetch(event.request);
    }

    // try {
    //     const harvesterBaseUrl = await getHarvesterBaseUrlForBookInstance(
    //         requestInfo.bookInstanceId
    //     );
    //     if (!harvesterBaseUrl) {
    //         return fetch(event.request);
    //     }

    //     return Response.redirect(
    //         `${harvesterBaseUrl}bloomdigital%2f${requestInfo.filePath}${requestUrl.search}`,
    //         302
    //     );
    // } catch (error) {
    //     console.error("Failed to redirect Bloom Player book request", error);
    //     return fetch(event.request);
    // }

    // orig url should be like http://localhost:5174/book/dc74c543-d82c-4d12-8dfd-90ef5e47be71/index.htm
    // http://localhost:5174/book/dc74c543-d82c-4d12-8dfd-90ef5e47be71/origami.css
    // http://localhost:5174/book/dc74c543-d82c-4d12-8dfd-90ef5e47be71/ArithmeticTemplate.css
    // etc.
    // the destination url should look like http://localhost:5174/s3/bloomharvest-sandbox/TkG1dWsW40%2f1768316502115/bloomdigital%2findex.htm
    // /s3/bloomharvest-sandbox/TkG1dWsW40%2f1768316502115/bloomdigital/ArithmeticTemplate.css
    //
    // TODO look up the parse ID, find the right url (reuse the code that /player/parseid uses) and return a redirect to it here
    // Make sure we are staying in the same database, dev vs prod
    // return new Response(
    //     '<!doctype html><html><head><meta charset="utf-8"><title>Intercept successful</title></head><body>Intercept succesful</body></html>',
    //     {
    //         headers: {
    //             "content-type": "text/html; charset=utf-8",
    //             "cache-control": "no-store",
    //         },
    //     }
    // );
}

function parseBookRequest(requestUrl) {
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

function constructParseBookQuery(bookInstanceId) {
    return new URLSearchParams({
        where: JSON.stringify({ bookInstanceId }),
        limit: "1",
        keys: "baseUrl,harvestState,bookInstanceId",
    });
}

async function retrieveBookData(query) {
    const connection = getParseConnection();
    const response = await fetch(`${connection.url}classes/books?${query}`, {
        headers: connection.headers,
    });

    if (!response.ok) {
        throw new Error(`Parse lookup failed: ${response.status}`);
    }

    const data = await response.json();
    return data.results?.[0];
}

function getParseConnection() {
    return createParseConnectionForHostname(self.location.hostname);
}

function getHarvesterBaseUrl(book) {
    if (!book || book.harvestState !== "Done" || !book.baseUrl) {
        return undefined;
    }

    let folderWithoutLastSlash = book.baseUrl;
    if (book.baseUrl.endsWith("%2f")) {
        folderWithoutLastSlash = book.baseUrl.substring(
            0,
            book.baseUrl.length - 3
        );
    }

    if (self.location.hostname === "localhost") {
        folderWithoutLastSlash = folderWithoutLastSlash.replace(
            "https://s3.amazonaws.com",
            "/s3"
        );
    }

    const index = folderWithoutLastSlash.lastIndexOf("%2f");
    if (index < 0) {
        return undefined;
    }

    const pathWithoutBookName = folderWithoutLastSlash.substring(0, index);
    return (
        pathWithoutBookName
            .replace("BloomLibraryBooks-Sandbox", "bloomharvest-sandbox")
            .replace("BloomLibraryBooks", "bloomharvest") + "/"
    );
}

function encodeBookFilePath(filePath) {
    return filePath
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("%2f");
}

// async function getHarvesterBaseUrlForBookInstance(bookInstanceId) {
//     if (harvesterBaseUrlCache.has(bookInstanceId)) {
//         return harvesterBaseUrlCache.get(bookInstanceId);
//     }

//     const book = await fetchBookFromParse(bookInstanceId);
//     const harvesterBaseUrl = getHarvesterBaseUrl(book);
//     if (harvesterBaseUrl) {
//         harvesterBaseUrlCache.set(bookInstanceId, harvesterBaseUrl);
//     }

//     return harvesterBaseUrl;
// }

// async function fetchBookFromParse(bookInstanceId) {
//     if (!parseConnection?.url) {
//         throw new Error("Parse connection has not been configured");
//     }

//     const params = new URLSearchParams({
//         where: JSON.stringify({ bookInstanceId }),
//         limit: "1",
//         keys: "baseUrl,harvestState,bookInstanceId",
//     });
//     const response = await fetch(
//         `${parseConnection.url}classes/books?${params.toString()}`,
//         {
//             headers: getParseHeaders(),
//         }
//     );

//     if (!response.ok) {
//         throw new Error(
//             `Parse lookup failed for ${bookInstanceId}: ${response.status}`
//         );
//     }

//     const data = await response.json();
//     return data.results?.[0];
// }

// function getParseHeaders() {
//     const headers = {};

//     if (parseConnection?.applicationId) {
//         headers["X-Parse-Application-Id"] = parseConnection.applicationId;
//     }

//     return headers;
// }

// function getHarvesterBaseUrl(book) {
//     if (!book || book.harvestState !== "Done" || !book.baseUrl) {
//         return undefined;
//     }

//     let folderWithoutLastSlash = book.baseUrl;
//     if (book.baseUrl.endsWith("%2f")) {
//         folderWithoutLastSlash = book.baseUrl.substring(
//             0,
//             book.baseUrl.length - 3
//         );
//     }

//     if (self.location.hostname === "localhost") {
//         folderWithoutLastSlash = folderWithoutLastSlash.replace(
//             "https://s3.amazonaws.com",
//             "/s3"
//         );
//     }

//     const index = folderWithoutLastSlash.lastIndexOf("%2f");
//     if (index < 0) {
//         return undefined;
//     }

//     const pathWithoutBookName = folderWithoutLastSlash.substring(0, index);
//     return (
//         pathWithoutBookName
//             .replace("BloomLibraryBooks-Sandbox", "bloomharvest-sandbox")
//             .replace("BloomLibraryBooks", "bloomharvest") + "/"
//     );
// }

async function requestCameFromBloomPlayer(event) {
    const clientId = event.clientId || event.resultingClientId;
    if (clientId) {
        const client = await self.clients.get(clientId);
        if (client && client.url.includes(bloomPlayerPath)) {
            return true;
        }
    }

    return event.request.referrer.includes(bloomPlayerPath);
}

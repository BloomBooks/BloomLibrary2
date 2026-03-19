export interface IParseConnection {
    headers: {
        "Content-Type": string;
        "X-Parse-Application-Id"?: string;
        "X-Parse-Session-Token"?: string;
    };
    url: string;
}

type ParseConnectionName = "prod" | "dev" | "local";

const parseConnectionTemplates: Record<
    ParseConnectionName,
    IParseConnection
> = {
    prod: {
        headers: {
            "Content-Type": "text/json",
            "X-Parse-Application-Id":
                "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
        },
        url: "https://server.bloomlibrary.org/parse/",
    },
    dev: {
        headers: {
            "Content-Type": "text/json",
            "X-Parse-Application-Id":
                "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR",
        },
        url: "https://dev-server.bloomlibrary.org/parse/",
    },
    local: {
        headers: {
            "Content-Type": "text/json",
            "X-Parse-Application-Id": "myAppId",
        },
        url: "http://localhost:1337/parse/",
    },
};

export function createParseConnection(
    connectionName: ParseConnectionName
): IParseConnection {
    const template = parseConnectionTemplates[connectionName];
    return {
        url: template.url,
        headers: { ...template.headers },
    };
}

export function createParseConnectionForHostname(
    hostname: string,
    port?: string
): IParseConnection {
    if (hostname === "localhost" && port === "1337") {
        return createParseConnection("local");
    }

    if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("dev")
    ) {
        return createParseConnection("dev");
    }

    return createParseConnection("prod");
}

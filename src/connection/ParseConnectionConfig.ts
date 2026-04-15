import { DataSource } from "./DataSource";

export interface IParseConnection {
    headers: {
        "Content-Type": string;
        "X-Parse-Application-Id"?: string;
        "X-Parse-Session-Token"?: string;
    };
    url: string;
}

const parseConnectionTemplates: Record<DataSource, IParseConnection> = {
    [DataSource.Prod]: {
        headers: {
            "Content-Type": "text/json",
            "X-Parse-Application-Id":
                "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
        },
        url: "https://server.bloomlibrary.org/parse/",
    },
    [DataSource.Dev]: {
        headers: {
            "Content-Type": "text/json",
            "X-Parse-Application-Id":
                "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR",
        },
        url: "https://dev-server.bloomlibrary.org/parse/",
    },
    [DataSource.Local]: {
        headers: {
            "Content-Type": "text/json",
            "X-Parse-Application-Id": "myAppId",
        },
        url: "http://localhost:1337/parse/",
    },
};

export function createParseConnection(
    connectionName: DataSource
): IParseConnection {
    const template = parseConnectionTemplates[connectionName];
    return {
        url: template.url,
        headers: { ...template.headers },
    };
}

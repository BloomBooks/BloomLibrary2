// ParseServer connection logic extracted from original connection layer
import { DataSource, getDataSource } from "../../../connection/DataSource";

// Connection configuration interface
export interface IParseConnection {
    headers: {
        "Content-Type": string;
        "X-Parse-Application-Id"?: string;
        "X-Parse-Session-Token"?: string;
    };
    url: string;
}

// Connection configurations for different environments
const prod: IParseConnection = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
    },
    url: "https://server.bloomlibrary.org/parse/",
};

const dev: IParseConnection = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR",
    },
    url: "https://dev-server.bloomlibrary.org/parse/",
};

const local: IParseConnection = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "myAppId",
    },
    url: "http://localhost:1337/parse/",
};

export class ParseConnection {
    private static connection: IParseConnection | null = null;

    public static getConnection(): IParseConnection {
        if (this.connection) {
            return { ...this.connection }; // Return a copy to prevent mutation
        }

        let result: IParseConnection;
        switch (getDataSource()) {
            default:
            case DataSource.Prod:
                result = { ...prod };
                break;
            case DataSource.Dev:
                result = { ...dev };
                break;
            case DataSource.Local:
                result = { ...local };
                break;
        }

        // Handle Bloom Reader user agent special case
        // The browser will not allow us to provide this key here if we're running on
        // Bloom Reader, which intercepts web requests in order to enable zipping data
        if (window.navigator.userAgent.indexOf("sil-bloom") >= 0) {
            delete result.headers["X-Parse-Application-Id"];
        }

        this.connection = result;
        return { ...result };
    }

    public static setSessionToken(token: string | undefined): void {
        const conn = this.getConnection();
        if (token) {
            conn.headers["X-Parse-Session-Token"] = token;
        } else {
            delete conn.headers["X-Parse-Session-Token"];
        }
        this.connection = conn;
    }

    public static clearSessionToken(): void {
        this.setSessionToken(undefined);
    }

    public static hasSessionToken(): boolean {
        const conn = this.getConnection();
        return !!conn.headers["X-Parse-Session-Token"];
    }

    public static getSessionToken(): string | undefined {
        const conn = this.getConnection();
        return conn.headers["X-Parse-Session-Token"];
    }

    // Reset connection (useful for testing)
    public static reset(): void {
        this.connection = null;
    }
}

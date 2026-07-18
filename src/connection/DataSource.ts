export enum DataSource {
    Prod = "prod",
    Dev = "dev",
    Local = "local",
}

export function getDataSourceForHostname(hostname: string): DataSource {
    //Uncomment to test dev or local data explicitly
    //return DataSource.Dev;
    //return DataSource.Local;

    if (hostname.startsWith("dev")) {
        return DataSource.Dev;
    }

    return DataSource.Prod;
}

export function getDataSource(): DataSource {
    return getDataSourceForHostname(window.location.hostname);
}

// True on a local dev machine (loopback hostnames only). Note this is deliberately NOT true for
// a LAN address, where the dev server is network-exposed. Callers use it to relax dev-only gates
// (e.g. the grids skip the login requirement) without opening those gates on any real deployment.
export function isLocalhost(
    hostname: string = window.location.hostname
): boolean {
    // window.location.hostname returns the IPv6 loopback bracketed ("[::1]"); accept both forms.
    return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
}

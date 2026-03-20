export enum DataSource {
    Prod = "prod",
    Dev = "dev",
    Local = "local",
}

export function getDataSourceForHostname(hostname: string): DataSource {
    //Uncomment to test dev or local data explicitly
    return DataSource.Dev;
    //return DataSource.Local;

    if (hostname.startsWith("dev")) {
        return DataSource.Dev;
    }

    return DataSource.Prod;
}

export function getDataSource(): DataSource {
    return getDataSourceForHostname(window.location.hostname);
}

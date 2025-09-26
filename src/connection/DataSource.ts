export enum DataSource {
    Prod,
    Dev,
    Local,
}

export function getDataSource(): DataSource {
    //Uncomment to test dev or local data explicitly
    //return DataSource.Dev;
    //return DataSource.Local;

    if (window.location.hostname.startsWith("dev")) {
        return DataSource.Dev;
    }

    return DataSource.Prod;
}

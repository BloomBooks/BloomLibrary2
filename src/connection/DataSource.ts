export enum DataSource {
    Prod,
    Dev,
    Local,
}

export function getDataSource(): DataSource {
    //Uncomment to test dev or local data explicitly
    //return DataSource.Dev;
    //return DataSource.Local;

    // For localhost development and testing, use dev server
    if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    ) {
        return DataSource.Dev;
    }

    if (window.location.hostname.startsWith("dev")) {
        return DataSource.Dev;
    }

    return DataSource.Prod;
}

const prod = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5"
    },
    url: "https://bloom-parse-server-production.azurewebsites.net/parse/"
};
const dev = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR"
    },
    url: "https://bloom-parse-server-develop.azurewebsites.net/parse/"
};

export function getConnection() {
    if (
        window.location.hostname === "bloomlibrary.org" ||
        window.location.hostname === "next.bloomlibrary.org"
    )
        return prod;

    // Storybook is currently configured to look at production
    if (
        window.location.hostname === "localhost" &&
        window.location.port === "9090"
    )
        return prod;

    return dev;
}

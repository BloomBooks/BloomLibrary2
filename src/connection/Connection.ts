const prod = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
        "X-Parse-REST-API-Key": "bAgoDIISBcscMJTTAY4mBB2RHLfkowkqMBMhQ1CD"
    },
    url: "https://bloom-parse-server-production.azurewebsites.net/parse/"
};
const dev = {
    headers: {
        "Content-Type": "text/json",
        "X-Parse-Application-Id": "yrXftBF6mbAuVu3fO6LnhCJiHxZPIdE7gl1DUVGR"
        // "X-Parse-REST-API-Key": "KZA7c0gAuwTD6kZHyO5iZm0t48RplaU7o3SHLKnj"
    },
    url: "https://bloom-parse-server-develop.azurewebsites.net/parse/"
};

export function getConnection() {
    return dev;
}

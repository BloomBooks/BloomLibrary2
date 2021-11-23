export function getBloomApiUrl(): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const local = "http://localhost:7071/v1";
    const prod = "https://api.bloomlibrary.org/v1";

    // Change this to return whichever one you want your requests to go to.
    return prod;
}

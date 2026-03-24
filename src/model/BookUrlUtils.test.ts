import { getHarvesterBaseUrlFromBaseUrl } from "./BookUrlUtils";
import { getUrlOfHtmlOfDigitalVersion } from "./BookUrlUtils";

describe("getHarvesterBaseUrlFromBaseUrl", () => {
    // Note these tests were written by copilot during a refactor, long after the original code was in use.
    // I haven't checked if they actually reflect our intended usage of the function, but thought we might as well keep
    // them around to detect any behavior changes

    it("converts a sandbox book base url to the harvester base url", () => {
        expect(
            getHarvesterBaseUrlFromBaseUrl(
                "https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d%2fsign+language+test%2f",
                false
            )
        ).toBe(
            "https://s3.amazonaws.com/bloomharvest-sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/"
        );
    });

    it("converts a production book base url to the harvester base url", () => {
        expect(
            getHarvesterBaseUrlFromBaseUrl(
                "https://s3.amazonaws.com/BloomLibraryBooks/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d%2fBook+Title%2f",
                false
            )
        ).toBe(
            "https://s3.amazonaws.com/bloomharvest/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/"
        );
    });

    it("uses the local s3 proxy when requested", () => {
        expect(
            getHarvesterBaseUrlFromBaseUrl(
                "https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d%2fsign+language+test%2f",
                true
            )
        ).toBe(
            "/s3/bloomharvest-sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/"
        );
    });

    it("handles a base url without a trailing encoded slash", () => {
        expect(
            getHarvesterBaseUrlFromBaseUrl(
                "https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d%2fsign+language+test",
                false
            )
        ).toBe(
            "https://s3.amazonaws.com/bloomharvest-sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/"
        );
    });

    it("returns undefined for malformed base urls without an encoded path separator", () => {
        expect(
            getHarvesterBaseUrlFromBaseUrl(
                "https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/no-encoded-slashes",
                false
            )
        ).toBeUndefined();
    });
});

describe("book URL helpers", () => {
    // Note these tests were written by copilot during a refactor, long after the original code was in use.
    // I haven't checked if they actually reflect our intended usage of the function, but thought we might as well keep
    // them around to detect any behavior changes
    it("builds bloom digital file urls from a harvester base url", () => {
        expect(
            getUrlOfHtmlOfDigitalVersion(
                "https://s3.amazonaws.com/bloomharvest/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/",
                "index.htm"
            )
        ).toBe(
            "https://s3.amazonaws.com/bloomharvest/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/bloomdigital%2findex.htm"
        );
    });
});

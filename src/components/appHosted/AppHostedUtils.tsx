import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIntl } from "react-intl";

// This file exports some constants and functions that are useful in various places where
// BloomLibrary behaves differently when embedded in an app (currently BloomReader).

// If we're constructing an app-hosted URL, this is what we insert.
// we're including a v1 in case we one day need a later version of this.
export const appHostedSegment = "app-hosted-v1";

// If this prefix is found in a URL, we're in app-hosted mode.
// We deliberately don't check the version, though eventually, if we need another version,
// something will presumably notice the difference.
export function useIsAppHosted() {
    const location = useLocation();
    return location.pathname.startsWith("/app-hosted-");
}
export function isAppHosted() {
    return window.location.pathname.startsWith("/app-hosted-");
}

// Return the equivalent URL path not in the app-hosted space.
// If necessary we could make this smarter about working with any version.
export function removeAppHostedFromPath(path: string): string {
    return path.replace("/" + appHostedSegment + "/", "/");
}

// Get the size of an artifact (file) we could possibly download from the web,
// without actually downloading it.
export function useGetArtifactSize(artifactUrl: string): string {
    const [artifactSize, setArtifactSize] = useState("");
    useEffect(() => {
        if (artifactUrl) {
            const xhr = new XMLHttpRequest();
            xhr.open("HEAD", artifactUrl, true); // Notice "HEAD" instead of "GET",
            //  to get only the header
            xhr.onreadystatechange = function () {
                if (this.readyState === this.DONE) {
                    const sizeString = xhr.getResponseHeader("Content-Length");
                    if (sizeString) {
                        const size = parseInt(sizeString);
                        if (size > 1000000) {
                            const mbTimes10 = Math.round(size / 1000000);
                            setArtifactSize(mbTimes10 / 10 + "MB");
                        } else {
                            const kbSize = Math.round(size / 1000);
                            setArtifactSize(kbSize + "KB");
                        }
                    }
                }
            };
            xhr.send();
        }
    }, [artifactUrl]);
    return artifactSize;
}

// Get the label we want to use to describe a collection or collection subset
// in app-hosted mode. (To allow it to be a hook, so it can useIntl, we arrange
// that it just returns undefined if we're not in that mode.)
export function useAppHostedCollectionLabel(
    collectionLabel: string | undefined,
    filters: string[],
    appHostedMode: boolean
) {
    const l10n = useIntl();
    if (!collectionLabel || !appHostedMode) {
        return undefined;
    }
    // or collectionLabel.replace(/\s*\(.*\)/, ""); if we need to strip off English name in parens
    let label = collectionLabel;
    for (const f of filters) {
        const filterName = f.replace(/:.*/, "");
        // This is good for 'topic', the only other filter currently in use in
        // app-hosted-v1/language. Just leaving it out means we get shorter labels like
        // "Get more Swahili level 2 Animal Story books"
        let filterLabel = "";
        if (filterName === "level") {
            filterLabel = l10n.formatMessage({
                id: "appHosted." + filterName,
                defaultMessage: filterName,
            });
        }
        // strip off the filter prefix to the first colon, then any remaining colons become spaces.
        const filterVal = f.replace(/.*?:/, "").replace(/:/g, " ");
        label += " " + filterLabel + (filterLabel ? " " : "") + filterVal;
    }
    return label.trim();
}

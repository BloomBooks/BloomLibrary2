// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// This file exports some constants and functions that are useful in various places where
// BloomLibrary behaves differently when embedded in an app (currently BloomReader).

// If we're constructing an app-hosted URL, this is what we insert.
// we're including a v1 in case we one day need a later version of this.
export const appHostedMarker = "app-hosted-v1";

// If this prefix is found in a URL, we're in app-hosted mode.
export function useIsAppHosted() {
    const location = useLocation();
    return location.pathname.startsWith("/app-hosted-");
}

// Return the equivalent URL path not in the app-hosted space.
// If necessary we could make this smarter about working with any version.
export function removeAppHostedFromPath(path: string): string {
    return path.replace("/" + appHostedMarker + "/", "/");
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

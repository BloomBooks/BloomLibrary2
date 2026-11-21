import React from "react";
import { OverlayBanner } from "./OverlayBanner";
import { isUsingStagingApi } from "../connection/ApiConnection";
import { addParamToUrl } from "./BlorgLink";

// Shown while this browser sends its API calls to staging (see getApiChoice()), so a tester
// doesn't forget they turned it on, and can switch back. English only: only testers see it.
export const StagingApiNotice: React.FunctionComponent<{}> = () => {
    if (!isUsingStagingApi()) {
        return null;
    }
    return (
        <OverlayBanner title="Staging API">
            Using staging-api.bloomlibrary.org.{" "}
            <a
                href="?api=prod"
                onClick={(e) => {
                    // Built when clicked, so the page's current query parameters are kept. A full
                    // page load, because the API choice is read once when the site loads.
                    e.preventDefault();
                    window.location.href = addParamToUrl(
                        window.location.href,
                        "api",
                        "prod"
                    );
                }}
            >
                Switch back
            </a>
        </OverlayBanner>
    );
};

export default StagingApiNotice;

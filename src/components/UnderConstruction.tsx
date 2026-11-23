import React from "react";
import { isAppHosted } from "./appHosted/AppHostedUtils";
import { OverlayBanner } from "./OverlayBanner";
import { isUsingStagingApi } from "../connection/ApiConnection";

export const UnderConstruction: React.FunctionComponent<{}> = () => {
    const showUnderConstruction =
        window.location.hostname !== "bloomlibrary.org" &&
        window.location.hostname !== "embed.bloomlibrary.org" &&
        !window.location.hostname.startsWith("dev") &&
        window.location.hostname !== "localhost" &&
        !isAppHosted();

    const [open, setOpen] = React.useState(true);
    return showUnderConstruction && open ? (
        <OverlayBanner
            title="Under Construction"
            onClose={() => setOpen(false)}
            // Sit above the staging API banner (StagingApiNotice) when it is showing too.
            bottomOffset={isUsingStagingApi() ? 90 : 0}
        >
            Thanks for previewing this "alpha" version of Bloom Library. If you
            run into problems, head back to{" "}
            <a href="https://bloomlibrary.org">bloomlibrary.org</a>
        </OverlayBanner>
    ) : null;
};

export default UnderConstruction;

import { Meta } from "@storybook/react";

import { DownloadsGroup } from "./DownloadsGroup";
import {
    ArtifactVisibilitySettings,
    ArtifactVisibilitySettingsGroup,
} from "../../model/ArtifactVisibilitySettings";
import { Book } from "../../model/Book";

/* ---------------------- NOTE ---------------------------
This shows the component, but isn't working great yet.
---------------------------------------------------------*/

const meta: Meta = {
    title: "Components/DownloadsGroup",
    component: DownloadsGroup,
    argTypes: {
        bloomPubAvailable: { control: "boolean", name: "BloomPub available?" },
        pdfAvailable: { control: "boolean", name: "PDF available?" },
    },
};

export default meta;

export const Default = (args: {
    bloomPubAvailable: boolean;
    pdfAvailable: boolean;
}) => {
    const testBook = new Book();
    testBook.harvestState = "Done";

    testBook.artifactsToOfferToUsers = new ArtifactVisibilitySettingsGroup();
    testBook.artifactsToOfferToUsers.bloomReader = new ArtifactVisibilitySettings(
        args.bloomPubAvailable
    );
    testBook.artifactsToOfferToUsers.pdf = new ArtifactVisibilitySettings(
        args.pdfAvailable
    );
    testBook.artifactsToOfferToUsers.epub = new ArtifactVisibilitySettings(
        true,
        true,
        true,
        true
    );

    return <DownloadsGroup book={testBook as Book} />;
};

Default.args = {
    bloomPubAvailable: true,
};

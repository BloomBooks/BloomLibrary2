import { Meta, StoryObj } from "@storybook/react";
import { ArtifactVisibilitySettings } from "../../../model/ArtifactVisibilitySettings";
import { ArtifactType } from "../ArtifactHelper";
import { ArtifactAndChoice } from "./ArtifactAndChoice";
import { StandAloneHarvesterArtifactUserControl } from "./ArtifactVisibilityPanel";

const meta: Meta<typeof StandAloneHarvesterArtifactUserControl> = {
    title: "Harvester Artifact Control",
    component: StandAloneHarvesterArtifactUserControl,
};

export default meta;
type Story = StoryObj<typeof StandAloneHarvesterArtifactUserControl>;

const triStateBooleanOptions = [undefined, false, true];
const toTriStateString = (value: boolean | undefined) => {
    if (value === undefined) return "undefined";
    return value.toString();
};

export const EntireControl: Story = {
    render: () => (
        <StandAloneHarvesterArtifactUserControl bookId="ddARA96sis" />
    ),
};

export const ArtifactAndChoiceStory: Story = {
    render: () => (
        <>
            {triStateBooleanOptions.map((user, i) =>
                triStateBooleanOptions.map((librarian, j) =>
                    triStateBooleanOptions.map((harvester, k) => (
                        <div
                            key={`${i}-${j}-${k}`}
                            style={{ marginBottom: 15 }}
                        >
                            <div>
                                {`(harvester: ${toTriStateString(
                                    harvester
                                )}, librarian: ${toTriStateString(
                                    librarian
                                )}, user: ${toTriStateString(user)}):`}
                            </div>
                            <ArtifactAndChoice
                                type={ArtifactType["epub"]}
                                visibilitySettings={
                                    new ArtifactVisibilitySettings(
                                        harvester,
                                        librarian,
                                        user
                                    )
                                }
                                url="https://google.com"
                                onChange={() => {}}
                                currentUserIsUploader={false}
                            />
                        </div>
                    ))
                )
            )}
        </>
    ),
};

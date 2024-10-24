import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { StandAloneHarvesterArtifactUserControl } from "../components/BookDetail/ArtifactVisibilityPanel/ArtifactVisibilityPanel";
import { ArtifactType } from "../components/BookDetail/ArtifactHelper";
import { ArtifactVisibilitySettings } from "../model/ArtifactVisibilitySettings";
import { ArtifactAndChoice } from "../components/BookDetail/ArtifactVisibilityPanel/ArtifactAndChoice";

const triStateBooleanOptions = [undefined, false, true];
const toTriStateString = (value: boolean | undefined) => {
    if (value === undefined) return "undefined";
    return value.toString();
};

export default {
    title: "Harvester Artifact Control",
    component: StandAloneHarvesterArtifactUserControl,
} as Meta;

export const EntireControl: StoryFn = () => (
    <StandAloneHarvesterArtifactUserControl bookId="ooQRXm0dbo" />
);

export const ArtifactAndChoiceStory: StoryFn = () => {
    let i = 0;
    return (
        <>
            {triStateBooleanOptions.map((user) => {
                return triStateBooleanOptions.map((librarian) => {
                    return triStateBooleanOptions.map((harvester) => {
                        return (
                            <div key={i++} style={{ marginBottom: 15 }}>
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
                        );
                    });
                });
            })}
        </>
    );
};

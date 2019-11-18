import React from "react";
import ReactDOM from "react-dom";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import { ArtifactAndChoice } from "./ArtifactAndChoice";
import { useGetBookDetail } from "../../connection/LibraryQueryHooks";
import { updateBook } from "../../connection/LibraryUpdates";
import {
    ArtifactType,
    getArtifactUrl,
    getArtifactSettings
} from "./HarvesterArtifactHelper";

// A set of controls by which the user can hide or show the artifacts for a book
// which the harvester produced.
export const HarvesterArtifactUserControl: React.FunctionComponent<{
    bookId: string;
    currentSession?: string;
    currentUserIsUploader?: boolean;
    currentUserIsAdmin?: boolean;
}> = props => {
    const book = useGetBookDetail(props.bookId);
    if (!book) return <></>;
    if (!book.harvestState || book.harvestState !== "Done") return <></>;

    const handleChange = (artifactType: ArtifactType, showSetting: string) => {
        let userDecision: boolean | undefined;
        if (showSetting === "auto") userDecision = undefined;
        else userDecision = showSetting === "show";

        let show = book.show;
        if (!show) show = {}; //shouldn't happen
        const showSettingForArtifact = show[artifactType];
        Object.assign(showSettingForArtifact, { user: userDecision });

        const params = { show: show };
        updateBook(props.bookId, params, props.currentSession);
    };

    const getExistingArtifacts = () => {
        return Object.keys(ArtifactType).filter(artifactTypeString => {
            let show = book.show;
            // For now, a harvested book with no show record is assumed to have these three artifacts
            if (!show) show = { epub: {}, bloomReader: {}, readOnline: {} };
            return show[artifactTypeString];
        });
    };

    return (
        <>
            <h4>As the uploader of this book, you also have these controls:</h4>
            <Box padding={1} border={1} borderRadius="borderRadius">
                Sometimes books created for one format don't look good in
                another. Use the following to hide any formats that look bad.
                {getExistingArtifacts().map((artifactTypeString, i) => {
                    // Some weirdness required to get the ArtifactType
                    // back from its string. I could find no other way
                    // to loop through the values of an enum in typescript.
                    const artifactType: ArtifactType = (ArtifactType as any)[
                        artifactTypeString
                    ];
                    return (
                        <div key={artifactType}>
                            <ArtifactAndChoice
                                type={artifactType}
                                showSettings={getArtifactSettings(
                                    book,
                                    artifactType
                                )}
                                url={getArtifactUrl(book, artifactType)}
                                onChange={showSetting =>
                                    handleChange(artifactType, showSetting)
                                }
                            ></ArtifactAndChoice>
                            {/* This ugly logic is just preventing a Divider after the last element */}
                            {Object.keys(ArtifactType).length !== i + 1 && (
                                <Divider />
                            )}
                        </div>
                    );
                })}
            </Box>
        </>
    );
};

export function connectHarvestArtifactUserControl(
    attachmentPoint: HTMLElement,
    props: any
) {
    ReactDOM.render(
        React.createElement(HarvesterArtifactUserControl, props),
        attachmentPoint
    );
}

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

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
    getArtifactSettings,
    getArtifactTypeFromKey,
    getDefaultShowValue as getDefaultArtifactVisibilitySettings
} from "./HarvesterArtifactHelper";

// A set of controls by which the user can hide or show the artifacts for a book
// which the harvester produced.
export const HarvesterArtifactUserControl: React.FunctionComponent<{
    bookId: string;
    currentSession?: string;
    currentUserIsUploader?: boolean;
    currentUserIsAdmin?: boolean;
    onChange?: () => {};
}> = props => {
    const book = useGetBookDetail(props.bookId);
    if (!book) return <></>;
    if (!book.harvestState || book.harvestState !== "Done") return <></>;

    const handleChange = (artifactType: ArtifactType, showSetting: string) => {
        let userDecision: boolean | undefined;
        if (showSetting === "auto") userDecision = undefined;
        else userDecision = showSetting === "show";

        let artifactsToOfferToUsers = book.artifactsToOfferToUsers;
        if (!artifactsToOfferToUsers) {
            artifactsToOfferToUsers = getDefaultArtifactVisibilitySettings();
        }

        Object.assign(artifactsToOfferToUsers[artifactType], {
            user: userDecision
        });

        book.saveArtifactVisibilityToParseServer();
        if (props.onChange) props.onChange();
    };

    // Ideally, this would return an array of ArtifactType,
    // but the only place it is currently called would have to iterate
    // using the keys again, so we would be converting back and forth needlessly.
    //
    // This method assumes the book has been harvested.
    const getExistingArtifactTypeKeys = (): Array<string> => {
        // For now, a harvested book with no show record is assumed to have these three artifacts.
        if (!book.artifactsToOfferToUsers)
            return ["epub", "bloomReader", "readOnline"];

        // It would be simpler to just return Object.keys(book.show),
        // but we want the resulting array to have the keys in the same
        // order as they appear in the enum. And we don't want any unexpected
        // keys which don't appear in the enum.
        return Object.keys(ArtifactType).filter(artifactTypeKey => {
            return (
                book.artifactsToOfferToUsers[
                    getArtifactTypeFromKey(artifactTypeKey)
                ] !== undefined
            );
        });
    };

    const artifactCount = getExistingArtifactTypeKeys().length;
    return (
        <div
            css={css`
                display: block;
            `}
        >
            <h4
                css={css`
                    margin-top: 0;
                `}
            >
                As the uploader of this book, you can control what formats to
                offer to people:
            </h4>
            <Box padding={1} border={1} borderRadius="borderRadius">
                Sometimes books created for one format don't look good in
                another. Use the following to hide any formats that look bad.
                {getExistingArtifactTypeKeys().map((artifactTypeKey, i) => {
                    const artifactType: ArtifactType = getArtifactTypeFromKey(
                        artifactTypeKey
                    );
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
                            {artifactCount !== i + 1 && <Divider />}
                        </div>
                    );
                })}
            </Box>
        </div>
    );
};

// The legacy angular bloomlibrary.org calls this. The production version of that build uses the
// the version of this library that is tagged as "legacyBlorgProduction" on TeamCity.
export function connectHarvestArtifactUserControl(
    attachmentPoint: HTMLElement,
    props: any
) {
    ReactDOM.render(
        React.createElement(HarvesterArtifactUserControl, props),
        attachmentPoint
    );
}

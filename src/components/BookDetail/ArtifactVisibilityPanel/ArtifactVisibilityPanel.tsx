// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import { ArtifactAndChoice } from "./ArtifactAndChoice";
import { useGetBookDetail } from "../../../connection/LibraryQueryHooks";
import {
    ArtifactType,
    getArtifactUrl,
    getArtifactVisibilitySettings,
    getArtifactTypeFromKey
} from "../ArtifactHelper";
import { Book } from "../../../model/Book";

// A set of controls by which the user can hide or show the artifacts for a book
// which the harvester produced.
export const HarvesterArtifactUserControl: React.FunctionComponent<{
    book: Book | null | undefined;
    currentSession?: string;
    currentUserIsUploader?: boolean;
    currentUserIsModerator?: boolean;
    onChange?: () => {};
}> = props => {
    const book = props.book;
    if (!book) return <React.Fragment></React.Fragment>;
    if (!book.harvestState || book.harvestState !== "Done")
        return (
            <React.Fragment>
                {`Harvest State: ${book.harvestState}`}
                <br />
                {`Harvest Log:${book.harvesterLog}`}
            </React.Fragment>
        );

    const handleChange = (artifactType: ArtifactType, newSetting: string) => {
        const artifactSettings = getArtifactVisibilitySettings(
            book,
            artifactType
        )!; // note on the "!": we know it isn't undefined because if the setting didn't exist, we wouldn't be showing a control for it.

        const decision: boolean | undefined =
            // if it's auto, we encode that with "undefined"
            newSetting === "auto"
                ? undefined
                : // otherwise it's true if we set it to show, false otherwise
                  newSetting === "show";

        if (props.currentUserIsUploader) {
            artifactSettings.user = decision;
        } else if (props.currentUserIsModerator) {
            artifactSettings.librarian = decision;
        }

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
    const msg = !!props.currentUserIsUploader
        ? "Our system takes your book and automatically formats it for use on phones and web browsers. But sometimes books don't look good in these formats. Because you are the uploader of this book, you can check over what our system created."
        : "Because you have STAFF permissions, you can control what formats to offer to people. The uploader can also do this.";
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
                {msg}
            </h4>
            <Box padding={1} border={1} borderRadius="borderRadius">
                Use the following to hide any formats that look bad.
                {getExistingArtifactTypeKeys().map((artifactTypeKey, i) => {
                    const artifactType: ArtifactType = getArtifactTypeFromKey(
                        artifactTypeKey
                    );
                    return (
                        <div key={artifactType}>
                            <ArtifactAndChoice
                                type={artifactType}
                                visibilitySettings={
                                    getArtifactVisibilitySettings(
                                        book,
                                        artifactType
                                    )!
                                }
                                url={getArtifactUrl(book, artifactType)}
                                onChange={showSetting =>
                                    handleChange(artifactType, showSetting)
                                }
                                currentUserIsUploader={
                                    !!props.currentUserIsUploader
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

// This version of the control doesn't require the caller to have previously created
// a book. That is useful to various tests and perhaps to the legacy angular Bloom Library,
// though we are currently expecting to fork this project and stick with an older
// version of HarvesterArtifactUserControl if we need modifications for that.
export const StandAloneHarvesterArtifactUserControl: React.FunctionComponent<{
    bookId: string;
    currentSession?: string;
    currentUserIsUploader?: boolean;
    currentUserIsModerator?: boolean;
    onChange?: () => {};
}> = props => {
    const book = useGetBookDetail(props.bookId);
    if (!book) return <React.Fragment></React.Fragment>;
    return (
        <HarvesterArtifactUserControl
            {...props}
            book={book}
        ></HarvesterArtifactUserControl>
    );
};

// This is what we use if the show column is not populated in parse.
// Before we started populating the show column, we only and always
// harvested epub, bloomReader, and readOnline. (Not currently used.)
// function getDefaultArtifactVisibilitySettings() {
//     return {
//         pdf: undefined,
//         epub: new ArtifactVisibilitySettings(),
//         bloomReader: new ArtifactVisibilitySettings(),
//         readOnline: new ArtifactVisibilitySettings(),
//         shellbook: new ArtifactVisibilitySettings()
//     };
// }

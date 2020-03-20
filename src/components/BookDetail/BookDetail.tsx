// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState, useContext } from "react";
import { useGetBookDetail } from "../../connection/LibraryQueryHooks";
import { Book } from "../../model/Book";
import WarningIcon from "@material-ui/icons/Warning";
import TranslationIcon from "./translation.svg";
import { IconButton, Divider, Link } from "@material-ui/core";
import { Alert } from "../Alert";

import { observer } from "mobx-react";
import { BookExtraPanels } from "./BookExtraPanels";
import { MetadataGroup } from "./MetadataGroup";
import { ArtifactGroup } from "./ArtifactGroup";
import { BookDetailHeaderGroup } from "./BookDetailHeaderGroup";
import { ReportButton } from "./ReportButton";
import { OSFeaturesContext } from "../../components/OSFeaturesContext";
import { commonUI } from "../../theme";

interface IProps {
    id: string;
}
const BookDetail: React.FunctionComponent<IProps> = props => {
    const book = useGetBookDetail(props.id);
    if (book === undefined) {
        return <div>Loading...</div>;
    } else if (book === null) {
        return <div>Sorry, we could not find that book.</div>;
    } else {
        return (
            <React.StrictMode>
                <BookDetailInternal book={book}></BookDetailInternal>
            </React.StrictMode>
        );
    }
};

export const BookDetailInternal: React.FunctionComponent<{
    book: Book;
}> = observer(props => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bloomDesktopAvailable, bloomReaderAvailable } = useContext(
        OSFeaturesContext
    );
    const showHarvesterWarning =
        props.book.getHarvestLog().indexOf("Warning") >= 0;
    const divider = (
        <Divider
            css={css`
                margin-top: 10px !important;
                margin-bottom: 10px !important;
                background-color: rgba(29, 148, 164, 0.13) !important;
                height: 2px !important;
            `}
        />
    );
    const [alertText, setAlertText] = useState<string | null>(null);
    const breakToColumn = "540px";

    return (
        <div
            // had width:800px, but that destroys responsiveness
            css={css`
                margin-left: auto;
                margin-right: auto;
                label: BookDetail;
                max-width: 800px;
            `}
        >
            <div
                css={css`
                    margin: ${commonUI.detailViewMargin};
                `}
            >
                <BookDetailHeaderGroup
                    book={props.book}
                    breakToColumn={breakToColumn}
                />
                {divider}
                <MetadataGroup
                    book={props.book}
                    breakToColumn={breakToColumn}
                />
                {divider}
                <div
                    css={css`
                        display: flex;
                        justify-content: space-between;
                    `}
                >
                    <div
                        css={css`
                            display: flex;
                            width: 100%;
                            justify-content: space-between;
                            flex-wrap: wrap;
                            align-items: center;
                            @media (max-width: ${breakToColumn}) {
                                flex-direction: column-reverse;
                                align-items: flex-start;
                            }
                        `}
                    >
                        <ReportButton
                            book={props.book}
                            css={css`
                                margin-right: auto;
                                justify-content: left;
                            `}
                        />

                        {/* Enhance, maybe, add this and wire to some message <HowToPrintButton />*/}
                        {bloomDesktopAvailable || (
                            <Link
                                color="secondary"
                                target="_blank"
                                rel="noopener noreferrer" // copied from LicenseLink
                                href="https://bloomlibrary.org/HowToTranslate.htm"
                                css={css`
                                    flex-shrink: 1;
                                    margin-right: 10px !important;
                                `}
                            >
                                <div
                                    css={css`
                                        display: flex;
                                        align-items: center;
                                    `}
                                >
                                    <img
                                        alt="Download Translation Icon"
                                        src={TranslationIcon}
                                        css={css`
                                            margin-right: 9px;
                                        `}
                                    />
                                    <div
                                        css={css`
                                            margin-top: 10px;
                                        `}
                                    >
                                        How to translate
                                    </div>
                                </div>
                            </Link>
                        )}
                        <ArtifactGroup book={props.book} />
                    </div>
                </div>

                {showHarvesterWarning && (
                    <IconButton
                        aria-label="harvester warning"
                        onClick={() => setAlertText(props.book.getHarvestLog())}
                    >
                        <WarningIcon />
                    </IconButton>
                )}

                <BookExtraPanels book={props.book} />
                <Alert
                    open={alertText != null}
                    close={() => {
                        setAlertText(null);
                    }}
                    message={alertText!}
                />
            </div>
        </div>
    );
});

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default BookDetail;

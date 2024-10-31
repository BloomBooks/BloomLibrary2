import { css } from "@emotion/react";

import React from "react";
import Button from "@material-ui/core/Button";
import BloomPubIcon from "../../assets/BloomPubWhite.svg?react";
import { commonUI } from "../../theme";
import { getArtifactUrl } from "./ArtifactHelper";
import { Book } from "../../model/Book";
import { ArtifactType } from "./ArtifactHelper";
import { getBookAnalyticsInfo } from "../../analytics/BookAnalyticsInfo";
import { track } from "../../analytics/Analytics";
import { FormattedMessage, useIntl } from "react-intl";

interface IProps {
    book: Book;
    fullWidth?: boolean;
    contextLangTag?: string;
}
export const ReadOfflineButton: React.FunctionComponent<IProps> = (props) => {
    const l10n = useIntl();
    const artifactUrl = getArtifactUrl(props.book, ArtifactType.bloomReader);
    const parts = artifactUrl.split("/");
    const fileName = parts[parts.length - 1];
    return (
        // A link to download the .bloomd/.bloompub file
        <a
            href={artifactUrl}
            // This is more than a hint. Without an explicit download attribute,
            // the browser will reload the whole SPA as it first tries to navigate
            // to the URL, then discovers that it's just a download.
            download={fileName}
            onClick={() => {
                const params = getBookAnalyticsInfo(
                    props.book,
                    props.contextLangTag,
                    "bloompub"
                );
                track("Download Book", params);
            }}
        >
            <Button
                variant="contained"
                color="secondary"
                startIcon={
                    <img
                        src={BloomPubIcon}
                        alt={l10n.formatMessage({
                            id: "book.detail.readOfflineIcon",
                            defaultMessage: "bloom reader document",
                        })}
                        css={css`
                            width: 60px;
                            margin-right: 10px;
                        `}
                    />
                }
                size="large"
                css={css`
                    width: ${props.fullWidth
                        ? "100%"
                        : commonUI.detailViewMainButtonWidth};
                    height: ${commonUI.detailViewMainButtonHeight};
                    margin-bottom: 10px !important;
                    float: right;
                `}
            >
                <div>
                    <h1
                        css={css`
                            margin-bottom: 0;
                            margin-top: 0;
                        `}
                    >
                        <p
                            css={css`
                                margin-bottom: 0;
                                margin-top: 0;
                                line-height: 19px;
                            `}
                        >
                            <FormattedMessage
                                id="book.detail.readOfflineButton"
                                defaultMessage="READ OFFLINE"
                            />
                        </p>
                    </h1>
                    <p
                        css={css`
                            margin-bottom: 0;
                            margin-top: 0;
                            font-size: 9px;
                            text-transform: none;
                        `}
                    >
                        <FormattedMessage
                            id="book.detail.readOfflineText"
                            defaultMessage="Download into Bloom Reader"
                        />
                    </p>
                </div>
            </Button>
        </a>
    );
};

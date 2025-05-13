import { css } from "@emotion/react";

import React from "react";
import Button from "@material-ui/core/Button";
import ReadIcon from "../../assets/Read.svg";
import ReadOnlineIcon from "../../assets/ReadOnline.svg";
import { commonUI } from "../../theme";
import { Book } from "../../model/Book";
import { useHistory } from "react-router-dom";
import { getUrlForTarget } from "../Routes";
import { FormattedMessage, useIntl } from "react-intl";
import { useIsAppHosted } from "../appHosted/AppHostedUtils";

interface IProps {
    book: Book;
    fullWidth?: boolean;
    contextLangTag?: string;
}
export const ReadButton: React.FunctionComponent<IProps> = (props) => {
    const l10n = useIntl();
    const history = useHistory();
    const url = getUrlForTarget(`player/${props.book.id}`);
    const isAppHosted = useIsAppHosted();

    const buttonTextId =
        "book.detail." + (isAppHosted ? "readOnlineButton" : "readButton");
    const buttonText = isAppHosted ? "READ ONLINE" : "READ";

    // This inserts breadcrumbs, embedding information, etc., which we don't want
    // since it interferes with the route for /player/X
    //const url = getUrlForTarget(`/player/${props.book.id}`);
    return (
        <Button
            variant={isAppHosted ? "outlined" : "contained"}
            color="primary"
            startIcon={
                <img
                    src={isAppHosted ? ReadOnlineIcon : ReadIcon}
                    alt={l10n.formatMessage({
                        id: buttonTextId,
                        defaultMessage: buttonText,
                    })}
                    css={css`
                        width: ${isAppHosted ? "50px" : "35px"};
                        margin-right: 10px;
                    `}
                />
            }
            size="large"
            css={css`
                width: ${props.fullWidth
                    ? "100%"
                    : commonUI.detailViewMainButtonWidth};
                height: ${isAppHosted
                    ? commonUI.detailViewSmallerButtonHeight
                    : commonUI.detailViewMainButtonHeight};
                margin-bottom: 10px !important;
                float: right;
            `}
            onClick={() => {
                props.book
                    .checkCountryPermissions("viewContentsInAnyWay")
                    .then((otherCountryRequired) => {
                        if (otherCountryRequired) {
                            alert(
                                `Sorry, the uploader of this book has restricted reading it to ${otherCountryRequired}`
                            );
                        } else {
                            // As part of BL-9307, we are not passing the title here anymore.
                            // Instead, we let ReadBookPage figure out the best title for the current iso
                            // code by itself.
                            // It's important to use react-dom's history here, because just setting
                            // the window's location will reload the page, and that will defeat
                            // the ReadBookPage's attempt to go full screen, because the browser
                            // thinks there has been no interaction with the page.
                            history.push(
                                "/" +
                                    url +
                                    (props.contextLangTag
                                        ? "?lang=" + props.contextLangTag
                                        : "")
                            );
                        }
                    });
            }}
        >
            <h1
                css={css`
                    margin-bottom: 15px; /*hack without which, the text is not in the vertical center of the button with the icon*/
                `}
            >
                <FormattedMessage
                    id={buttonTextId}
                    defaultMessage={buttonText}
                />
            </h1>
        </Button>
    );
};

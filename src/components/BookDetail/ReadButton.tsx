// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import Button from "@material-ui/core/Button";
import ReadIcon from "../../assets/Read.svg";
import { commonUI } from "../../theme";
import { Book } from "../../model/Book";
import { useHistory } from "react-router-dom";
import { getUrlForTarget } from "../Routes";
import { FormattedMessage, useIntl } from "react-intl";

interface IProps {
    book: Book;
    fullWidth?: boolean;
    contextLangIso?: string;
}
export const ReadButton: React.FunctionComponent<IProps> = (props) => {
    const l10n = useIntl();
    const history = useHistory();
    const url = getUrlForTarget(`player/${props.book.id}`);

    // This inserts breadcrumbs, embedding information, etc., which we don't want
    // since it interferes with the route for /player/X
    //const url = getUrlForTarget(`/player/${props.book.id}`);
    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={
                <img
                    src={ReadIcon}
                    alt={l10n.formatMessage({
                        id: "book.detail.readButton",
                        defaultMessage: "READ",
                    })}
                    css={css`
                        width: 35px;
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
                                    (props.contextLangIso
                                        ? "?lang=" + props.contextLangIso
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
                    id="book.detail.readButton"
                    defaultMessage="READ"
                />
            </h1>
        </Button>
    );
};

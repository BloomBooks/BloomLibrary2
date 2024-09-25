import css from "@emotion/css/macro";
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { commonUI } from "../../theme";
import { useIntl } from "react-intl";
import { Book } from "../../model/Book";
import { BookNotice } from "./BookNotice";
import { BookProblemNotice } from "./BookProblemNotice";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
export const HarvesterProgressNotice: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    const l10n = useIntl();
    if (
        props.book.harvestState !== "New" &&
        props.book.harvestState !== "InProgress"
    )
        return null;

    if (!props.book.lastUploadedDate) {
        // Actually, there are over 5k books with no lastUploadedDate.
        // And if we reharvest one, we get this message until harvester finishes.
        // We could just use created date, but that would lead to the problem message below
        // which would be incorrect.
        // return (
        // <BookProblemNotice>
        //     Error: lastUploadedDate should not be missing.
        // </BookProblemNotice>
        // );
        return null;
    }

    // How many hours has this thing been sitting at "New"?
    const now = new Date();
    const msDifference = now.valueOf() - props.book.lastUploadedDate!.valueOf();
    const hours = Math.floor(msDifference / 1000 / 60 / 60);

    // Past one hour, we tell them something is wrong. This might be false... we might just
    // be really busy, e.g. if they just uploaded a hundred books. But there is no way at the moment
    // for us to know the actual status of the Harvester, so being vague here is the best we can do.
    if (hours > 0) {
        return (
            <BookProblemNotice>
                {l10n.formatMessage({
                    id: "book.harvesterTakingTooLongNotice",
                    defaultMessage:
                        "We apologize for the inconvenience, but our server seems to be having problems processing newly uploaded books.",
                })}
                {/* intentionally not localizing this... it's really for us. */}
                {` (${hours} hours since upload)`}
            </BookProblemNotice>
        );
    } else
        return (
            <BookNotice
                css={css`
                    background-color: ${commonUI.colors
                        .resourcesArea} !important;
                    * {
                        color: white !important;
                    }
                `}
            >
                <HourglassEmptyIcon />
                <div
                    css={css`
                        margin-left: 10px;
                        a {
                            text-decoration: underline;
                        }
                    `}
                >
                    {l10n.formatMessage({
                        id: "book.harvesterSoon",
                        defaultMessage:
                            "This book has recently arrived in the Bloom Library and should be processed soon. Please check back in a few minutes.",
                    })}
                </div>
            </BookNotice>
        );
};

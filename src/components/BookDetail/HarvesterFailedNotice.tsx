import React from "react";
import { useIntl } from "react-intl";
import { BookProblemNotice } from "./BookProblemNotice";

export const HarvesterFailedNotice: React.FunctionComponent<{}> = () => {
    const l10n = useIntl();

    return (
        <BookProblemNotice errorIcon={true}>
            {l10n.formatMessage({
                id: "book.harvesterFailedNotice",
                defaultMessage:
                    "Our server encountered a problem while processing this book. The developers have been notified.",
            })}
        </BookProblemNotice>
    );
};

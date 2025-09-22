import React, { ReactElement, useEffect, useState } from "react";
import { Book } from "../../model/Book";
import { BlorgLink } from "../BlorgLink";
import { useIntl } from "react-intl";
import { BookProblemNotice } from "./BookProblemNotice";

export const InvalidFontNotice: React.FunctionComponent<{ book: Book }> = (
    props
) => {
    const l10n = useIntl();
    const [names, setNames] = useState<string[]>([]);
    useEffect(() => {
        setNames(props.book.getInvalidFontNames());
    }, [props.book]);
    if (!names || names.length === 0) {
        return null;
    }

    const listOfNames = names.join(", ");

    return (
        <BookProblemNotice>
            {l10n.formatMessage({
                id: "book.invalidFontsNotice",
                defaultMessage:
                    "We cannot fully present this book because it uses one or more fonts that are not known to be free and open-licensed.  Therefore, the PDF and source files are all we are allowed to distribute.  Please try to replace these fonts with ones that have open licenses:",
            })}
            &nbsp;{listOfNames}
            {"."}
        </BookProblemNotice>
    );
};

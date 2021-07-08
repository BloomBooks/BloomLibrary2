import React, { ReactElement, useEffect, useState } from "react";
import { Book } from "../../model/Book";
import { BlorgLink } from "../BlorgLink";
import { useIntl } from "react-intl";
import { BookProblemNotice } from "./BookProblemNotice";

export const MissingFontNotice: React.FunctionComponent<{ book: Book }> = (
    props
) => {
    const l10n = useIntl();
    const [links, setLinks] = useState<ReactElement[]>([]);

    useEffect(() => {
        const missingFontNames = props.book.getMissingFontNames();
        setLinks(
            missingFontNames.map((fontName) => (
                <BlorgLink
                    key={fontName}
                    alwaysnewtab={true}
                    color="primary"
                    href={`https://docs.google.com/forms/d/e/1FAIpQLSeo_lwdTU0JY4Nw1zlo1LCceXkLBWcATfWItnS7FqX5Aa3NUg/viewform?usp=pp_url&entry.1604864976=${window.location.href}&entry.1767307754=${fontName}`}
                >
                    {fontName}
                </BlorgLink>
            ))
        );
    }, [props.book]);

    if (!links || links.length === 0) {
        return null;
    }

    const listOfLinks = links.reduce(
        (prev: JSX.Element, curr: JSX.Element): any => [prev, ", ", curr]
    );

    return (
        <BookProblemNotice>
            {l10n.formatMessage({
                id: "book.missingFontsNotice",
                defaultMessage:
                    "We cannot fully present this book because it uses one or more fonts that BloomLibrary.org does not have. Please help us to find each font by clicking on its name and answering some questions: ",
            })}
            &nbsp;{listOfLinks}
            {"."}
        </BookProblemNotice>
    );
};

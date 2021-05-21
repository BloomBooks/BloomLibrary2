import css from "@emotion/css/macro";
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { ReactElement, useEffect, useState } from "react";
import { Book } from "../../model/Book";
import { BlorgLink } from "../../components/BlorgLink";
import { commonUI } from "../../theme";
import ReportProblemOutlinedIcon from "@material-ui/icons/ReportProblemOutlined";
import { Paper } from "@material-ui/core";
import { useIntl } from "react-intl";

export const MissingFontBlock: React.FunctionComponent<{ book: Book }> = (
    props
) => {
    const l10n = useIntl();
    const [links, setLinks] = useState<ReactElement[]>([]);

    useEffect(() => {
        const missingFontNames = props.book.getMissingFontNames();
        setLinks(
            missingFontNames.map((n) => (
                <BlorgLink
                    alwaysNewTab={true}
                    color="primary"
                    href={`https://docs.google.com/forms/d/e/1FAIpQLSeo_lwdTU0JY4Nw1zlo1LCceXkLBWcATfWItnS7FqX5Aa3NUg/viewform?usp=pp_url&entry.1604864976=${window.location.href}&entry.1767307754=${n}`}
                >
                    {n}
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
        <Paper
            css={css`
                padding: 10px;
                display: flex;
                flex-direction: row;
                color: ${commonUI.colors.bloomRed};
                background-color: white;
                margin-top: 10px;

                a {
                    text-decoration: underline;
                }
            `}
        >
            <ReportProblemOutlinedIcon />
            <div
                css={css`
                    margin-left: 10px;
                `}
            >
                {l10n.formatMessage({
                    id: "book.missingFontsPre",
                    defaultMessage:
                        "We cannot fully present this book because it uses one or more fonts that BloomLibrary.org does not have. Please help us to find each font by clicking on its name and answering some questions: ",
                })}
                &nbsp;{listOfLinks}
                {"."}
            </div>
        </Paper>
    );
};

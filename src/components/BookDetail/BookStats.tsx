// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import useAxios from "@use-hooks/axios";
import { Book } from "../../model/Book";
import { FormattedMessage, useIntl } from "react-intl";
import { getBloomApiUrl } from "../../connection/ApiConnection";
import { BookDetailInfoWidget } from "./BookDetailInfoWidget";

// The casing here is unfortunate, but that's what the database gives us no matter what we do there.
// Could be enhanced by remapping all the fields in the Azure function or here, but those
// didn't seem worth it just to change the case.
interface IBookStats {
    bookid: string;
    totalreads: number;
    totaldownloads: number;
    shelldownloads: number;
    devicecount: number;
    libraryviews: number;
}

function getInitialBookStats() {
    return {
        bookid: "",
        totalreads: 0,
        totaldownloads: 0,
        shelldownloads: 0,
        devicecount: 0,
        libraryviews: 0,
    };
}

// Display a string of stats about a particular book's usage such as `6 views, 3 reads, 2 devices, 1 shell downloads`.
// We purposely use the term "stats" rather than "analytics" to try to distinguish, in code, between
// analytics - the reporting of information about usage
// and
// stats - the consumption of information about usage.
// If there is nothing meaningful to display, we display nothing.
export const BookStats: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    function useGetBookStats(book: Book): IBookStats {
        const { response } = useAxios({
            url: `${getBloomApiUrl()}/stats/reading/book`,
            method: "POST",
            options: {
                data: {
                    filter: {
                        // The database function is currently written to get some information (blorg stuff) via bookId (parse ID)
                        // and some (BR stuff) by bookInstanceId.
                        // I think we may be able to switch to only using bookInstanceId at some point.
                        bookId: book.id,
                        bookInstanceId: book.bookInstanceId,
                    },
                },
            },
            trigger: book.id,
        });
        return response?.["data"]?.["stats"]?.[0] ?? getInitialBookStats();
    }

    const bookStats = useGetBookStats(props.book);

    const tooltipcontents = (
        <div>
            <ul
                css={css`
                    list-style: disc;
                    margin-left: 16px;
                    padding: 0;
                    li {
                        margin-bottom: 1em;
                    }
                `}
            >
                <li>
                    <FormattedMessage
                        id="stats.book.summaryString.readExplanation"
                        defaultMessage="'reads' is a count of how many times someone has read this book in a digital form from which we receive analytics. We cannot currently get analytics from epub versions. Because books can be read offline, we may not have a record of all reads."
                    />
                </li>
                <li>
                    <FormattedMessage
                        id="stats.book.summaryString.deviceExplanation"
                        defaultMessage="'devices' is a count of how many phones/tablets/computers have this book installed in Bloom Reader."
                    />
                </li>
                <li>
                    <FormattedMessage
                        id="stats.book.summaryString.downloadForTranslationExplanation"
                        defaultMessage="'downloads for translation' is a count of how times someone has clicked 'Translate into your own language' in order to load the book into Bloom for translation."
                    />
                </li>
            </ul>
            <p>
                <FormattedMessage
                    id="stats.book.summaryString.range"
                    defaultMessage="This starting date for these statistics vary by when we started recording them. They are updated every 24 hours."
                />
            </p>
            <p>
                <FormattedMessage
                    id="stats.book.summaryString.furtherStats"
                    defaultMessage="Enterprise customers can get a set of charts and downloadable data which includes information on all of their books, including where books are being read and growth over time."
                />
            </p>
        </div>
    );
    // just show the stats that we have values for
    const l10n = useIntl();
    const statStrings = [];
    if (bookStats.totalreads)
        statStrings.push(
            l10n.formatMessage(
                {
                    id: "stats.book.reads",
                    defaultMessage: "{count} reads",
                },
                { count: bookStats.totalreads }
            )
        );
    if (bookStats.devicecount)
        statStrings.push(
            l10n.formatMessage(
                {
                    id: "stats.book.devices",
                    defaultMessage: "{count} devices",
                },
                { count: bookStats.devicecount }
            )
        );
    if (bookStats.shelldownloads)
        statStrings.push(
            l10n.formatMessage(
                {
                    id: "stats.book.downloads",
                    defaultMessage: "{count} downloads for translation",
                },
                { count: bookStats.shelldownloads }
            )
        );
    const statsSummary = statStrings.join(", ");

    // fade in the stats with an info icon once we have some stats
    return (
        <div
            css={css`
                display: flex;
                //visibility: ${statStrings.length > 0 ? "visible" : "hidden"};
                opacity: ${statStrings.length > 0 ? 1 : 0};
                transition: opacity 1s ease-in;
            `}
        >
            <div>{statsSummary}</div>

            <BookDetailInfoWidget>{tooltipcontents}</BookDetailInfoWidget>
        </div>
    );
};

import React from "react";
import useAxios from "@use-hooks/axios";

import { Book } from "../../model/Book";

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
            url: `https://api.bloomlibrary.org/v1/stats?book=${book.id}&book-instance-id=${book.bookInstanceId}`,
            // Use this when debugging changes to the Azure function
            // url: `http://localhost:7071/v1/stats?book=${book.id}&book-instance-id=${book.bookInstanceId}`,
            method: "GET",
            trigger: book.id,
        });
        if (response && response["data"] && response["data"]["bookstats"])
            return response["data"]["bookstats"];
        return getInitialBookStats();
    }

    function shouldDisplayBookStats(stats: IBookStats): boolean {
        return (
            stats.totaldownloads > 0 ||
            stats.totalreads > 0 ||
            stats.libraryviews > 0
        );
    }

    const bookStats = useGetBookStats(props.book);
    return (
        (shouldDisplayBookStats(bookStats) && (
            <div>{`${bookStats.libraryviews || 0} views, ${
                bookStats.totalreads || 0
            } reads, ${bookStats.devicecount || 0} devices, ${
                bookStats.shelldownloads || 0
            } shell downloads`}</div>
        )) ||
        null
    );
};

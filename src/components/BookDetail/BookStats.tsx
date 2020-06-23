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

export const BookStats: React.FunctionComponent<{
    book: Book;
}> = (props) => {
    function useGetBookStats(book: Book): IBookStats {
        const { response } = useAxios({
            url: `https://api.bloomlibrary.org/v1/stats?book=${book.id}&book-instance-id=${book.bookInstanceId}`,
            // Use this when debugging changes to the Azure function
            // url: `http://localhost:7071/v1/stats?book=${book.id}&book-instance-id=${book.bookInstanceId}`,
            method: "GET",
            trigger: "true",
        });
        if (response && response["data"] && response["data"]["bookstats"])
            return response["data"]["bookstats"];
        return getInitialBookStats();
    }

    function shouldDisplayBookStats(bookStats: IBookStats): boolean {
        return (
            bookStats.totaldownloads > 0 ||
            bookStats.totalreads > 0 ||
            bookStats.libraryviews > 0
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

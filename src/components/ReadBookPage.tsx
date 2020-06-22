// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect, useCallback } from "react";
import { useGetBookDetail } from "../connection/LibraryQueryHooks";
import { Book } from "../model/Book";
import { getUrlOfHtmlOfDigitalVersion } from "./BookDetail/ArtifactHelper";
import { useHistory, useLocation } from "react-router-dom";
import { useTrack } from "../analytics/Analytics";
import { getBookAnalyticsInfo } from "../analytics/BookAnalyticsInfo";
import { useDocumentTitle } from "./Routes";
import {
    beforePlayerUnloads,
    startingBook,
} from "../analytics/BloomPlayerAnalytics";

export const ReadBookPage: React.FunctionComponent<{
    id: string;
}> = (props) => {
    const id = props.id;
    const history = useHistory();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const lang = query.get("lang");
    const contextLangIso = lang ? lang : undefined;
    // We need to do some analytics stuff when the user stops reading the book.
    // Note that it's usually possible in an SPA to change pages without raising
    // this event. If that becomes possible here, anything that does it should call
    // this function. But it's not a problem currently.
    useEffect(() => {
        window.addEventListener("beforeunload", beforePlayerUnloads);
        return () => {
            window.removeEventListener("beforeunload", beforePlayerUnloads);
        };
    }, []);
    useEffect(() => startingBook(), [id]);

    useDocumentTitle("Play"); // Note that the title comes from the ?title parameter, if present. This "Play" will not normally be used.
    const handleMessageFromBloomPlayer = useCallback(
        (event: MessageEvent) => {
            try {
                const r = JSON.parse(event.data);
                if (r.messageType === "backButtonClicked") {
                    // This apparently triggers the beforeunload event, though my
                    // intuition says it shouldn't. If ever it doesn't, or
                    // we replace it with something that doesn't, beforePlayerUnloads()
                    // needs to be called.
                    history.goBack();
                    // without a timeout, sometimes this works, sometimes it doesn't
                    window.setTimeout(() => history.goBack(), 200);
                }
            } catch (err) {
                console.log(`Got error with message: ${err}`);
            }
        },
        [history]
    );

    useEffect(() => {
        window.addEventListener("message", handleMessageFromBloomPlayer);
        return () => {
            window.removeEventListener("message", handleMessageFromBloomPlayer);
        };
    }, [handleMessageFromBloomPlayer]);

    const book = useGetBookDetail(id);
    useTrack(
        "Download Book",
        getBookAnalyticsInfo(book, contextLangIso, "read"),
        !!book
    );
    const url = book ? getUrlOfHtmlOfDigitalVersion(book) : "working"; // url=working shows a loading icon

    // use the bloomplayer.htm we copy into our public/ folder, where CRA serves from
    // TODO: this isn't working with react-router, but I don't know how RR even gets run inside of this iframe
    const bloomPlayerUrl = "/bloom-player/bloomplayer.htm";

    const langParam = contextLangIso ? `&lang=${contextLangIso}` : "";

    const iframeSrc = `${bloomPlayerUrl}?url=${url}&showBackButton=true&useOriginalPageSize=true${langParam}`;

    return (
        <iframe
            title="bloom player"
            css={css`
                border: none;
                width: 100%;
                height: 100%;
            `}
            src={iframeSrc}
            //src={"https://google.com"}
        ></iframe>
        // <div>I am groot</div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getHarvesterBaseUrl(book: Book) {
    // typical input url:
    // https://s3.amazonaws.com/BloomLibraryBooks-Sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d%2fsign+language+test%2f
    // want:
    // https://s3.amazonaws.com/bloomharvest-sandbox/ken%40example.com%2faa647178-ed4d-4316-b8bf-0dc94536347d/
    // We come up with that URL by
    //  (a) changing BloomLibraryBooks{-Sandbox} to bloomharvest{-sandbox}
    //  (b) strip off everything after the next-to-final slash
    let folderWithoutLastSlash = book.baseUrl;
    if (book.baseUrl.endsWith("%2f")) {
        folderWithoutLastSlash = book.baseUrl.substring(
            0,
            book.baseUrl.length - 3
        );
    }
    const index = folderWithoutLastSlash.lastIndexOf("%2f");
    const pathWithoutBookName = folderWithoutLastSlash.substring(0, index);
    return (
        pathWithoutBookName
            .replace("BloomLibraryBooks-Sandbox", "bloomharvest-sandbox")
            .replace("BloomLibraryBooks", "bloomharvest") + "/"
    );
    // Using slash rather than %2f at the end helps us download as the filename we want.
    // Otherwise, the filename can be something like ken@example.com_007b3c03-52b7-4689-80bd-06fd4b6f9f28_Fox+and+Frog.bloomd
}

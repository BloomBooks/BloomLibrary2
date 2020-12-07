// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect, useCallback, useState, useRef } from "react";
import { useGetBookDetail } from "../connection/LibraryQueryHooks";
import { Book } from "../model/Book";
import { getUrlOfHtmlOfDigitalVersion } from "./BookDetail/ArtifactHelper";
import { useHistory, useLocation } from "react-router-dom";
import { useTrack } from "../analytics/Analytics";
import { getBookAnalyticsInfo } from "../analytics/BookAnalyticsInfo";
import {
    useSetBrowserTabTitle,
    getUrlForTarget,
    previousPathname,
} from "./Routes";
import {
    sendPlayerClosingAnalytics,
    startingBook,
} from "../analytics/BloomPlayerAnalytics";
import { useMediaQuery } from "@material-ui/core";

export const ReadBookPage: React.FunctionComponent<{
    id: string;
}> = (props) => {
    const id = props.id;
    const history = useHistory();
    const location = useLocation();
    const widerThanPhone = useMediaQuery("(min-width:450px)"); // a bit more than the largest phone width in the chrome debugger (411px)
    const higherThanPhone = useMediaQuery("(min-height:450px)");
    // If either dimension is smaller than a phone, we'll guess we are on one
    // and go full screen automatically.
    const autoFullScreen = !widerThanPhone || !higherThanPhone;
    const query = new URLSearchParams(location.search);
    const [, setCounter] = useState(0); // used to force render after going to full screen
    const lang = query.get("lang");
    const [rotateParams, setRotateParams] = useState({
        canRotate: true,
        isLandscape: false,
    });
    const contextLangIso = lang ? lang : undefined;
    const fullScreenChangeHandler = () => {
        setCounter((oldCount) => oldCount + 1); // force a render
    };

    // This variable and function work with the first line of the following
    // useEffect to help us get notified when the user leaves this page to
    // go to another page INSIDE our own SPA, usually by hitting the back button.
    // See the comment in the useEffect.
    const unregisterHistory = useRef<(() => void) | undefined>();
    const unloadToOwnSpa = () => {
        onPlayerUnloading();
        unregisterHistory.current!();
        unregisterHistory.current = undefined;
    };

    // We need to do various things when the user stops reading the book.
    // Note that it's usually possible in an SPA to change pages without raising
    // this event. If that becomes possible here, anything that does it should call
    // this function. But it's not a problem currently.
    useEffect(() => {
        // The normal thing to do is to save this function locally and call it in the
        // function we return. But if we do that, the listener never gets called.
        // I suppose it must be removed before the code that invokes it runs.
        // Instead, leave the listener active until it gets called. If we load
        // some new page, everything gets cleared; if we stay in the SPA and go
        // somewhere else, it eventually gets called and cleared (in the
        // unloadToOwnSpa() function itself). And so we can track events that don't
        // trigger beforeunload because we're not, from the browser's
        // point of view, leaving the current page.
        unregisterHistory.current = history.listen(unloadToOwnSpa);
        window.addEventListener("beforeunload", onPlayerUnloading);
        // This works in Android browser (Android 6, at least), but not in Chrome. I think Chrome
        // considers it a security issue for the app to know when the user
        // uses escape to exit full screen mode, so there is no way
        // we can find out we need to put the button back.
        document.addEventListener("fullscreenchange", fullScreenChangeHandler);
        const unregisterCallback = history.listen(onPlayerUnloading);
        return () => {
            unregisterCallback();
            window.removeEventListener("beforeunload", onPlayerUnloading);
            document.removeEventListener(
                "fullscreenchange",
                fullScreenChangeHandler
            );
        };
        // I don't actually want all the above to happen more than once.
        // But Lint insists it should depend on history, and I don't think
        // history will ever change, so doing so should be harmless.
    }, [history]);
    useEffect(() => startingBook(), [id]);

    // We don't use rotateParams here, because one caller wants to call it
    // immediately after calling setRotateParams, when the new values won't be
    // available.
    const setupScreen = (canRotate: boolean, isLandscape: boolean) => {
        document.documentElement
            .requestFullscreen()
            .then(() => {
                setCounter((oldCount) => oldCount + 1); // force a render
                // We are only allowed to do this this if successfully in full screen mode
                if (!canRotate) {
                    window.screen.orientation.lock(
                        isLandscape ? "landscape" : "portrait"
                    );
                }
            })
            // If we can't do it, we can't. That's what the full screen button is for.
            // We're not allowed to go full-screen, for example, if we're starting
            // out on this page and haven't touched a button.
            .catch(() => {});
    };

    useSetBrowserTabTitle("Play"); // Note that the title comes from the ?title parameter, if present. This "Play" will not normally be used.
    const handleMessageFromBloomPlayer = useCallback(
        (event: MessageEvent) => {
            try {
                const r = JSON.parse(event.data);
                if (r.messageType === "backButtonClicked") {
                    // History.push doesn't automatically raise beforeunload, since
                    // from the browser's point of view we're staying on the same page.
                    // Easiest just to call the function we want ourselves.
                    onPlayerUnloading();
                    // We don't want to use history.goBack() because we might have
                    // come direct to the read-book page by following a URL, and
                    // we want this arrow to give us a way into the Bloom site.
                    let whereToGo = `/book/${id}`;
                    // wish all this knowedge didn't have to be here
                    if (lang) {
                        whereToGo += `?lang=${lang}`;
                    }
                    history.push("/" + getUrlForTarget(whereToGo));
                } else if (r.messageType === "reportBookProperties") {
                    const canRotate = r.params?.canRotate as boolean;
                    const isLandscape = r.params?.landscape as boolean;
                    setRotateParams({ canRotate, isLandscape });
                    if (autoFullScreen) {
                        setupScreen(canRotate, isLandscape);
                    }
                } else if (r.messageType === "fullScreen") {
                    setupScreen(
                        rotateParams.canRotate,
                        rotateParams.isLandscape
                    );
                }
            } catch (err) {
                console.log(`Got error with message: ${err}`);
            }
        },
        [
            autoFullScreen,
            history,
            id,
            lang,
            rotateParams.canRotate,
            rotateParams.isLandscape,
        ]
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

    // This is an attempt to determine whether we came here directly from the detail view (of the same book).
    // If so, the user can easily get back there using the browser back button.
    // If not, we want to show a button for getting to the detail view. It provides lots of helpful
    // information that might be hard to find if the Read view is our first glimpse of this book.
    // This strategy for determining whether we 'came from' detail view is not perfect; we can only really
    // know where we came from within our own SPA. For example, if the user hits Refresh while in this screen
    // having come from detail view, the button will appear, as the reloaded page has no record of...no access
    // to...the prior history, even though 'back' will in fact also go to the detail view (but popping the
    // history stack rather than pushing onto it).
    // (Note: historically, this was a 'back' button in BloomPlayer; but currently its appearance is three
    // dots meaning 'more' when BP is embedded in an iframe, and the back arrow only occurs in Bloom Reader.
    // Here, it does not 'go back' but pushes the detail view as a new history entry.)
    const showBackButton = previousPathname.indexOf(`/book/${id}`) < 0;

    const iframeSrc =
        `${bloomPlayerUrl}?url=${encodeURIComponent(
            url
        )}&showBackButton=${showBackButton}&centerVertically=false&useOriginalPageSize=true` +
        `${langParam}&hideFullScreenButton=${autoFullScreen}&independent=false&host=bloomlibrary`;

    // This theme matches Bloom-player. It is supposed to help the full-screen button
    // better match the Bloom-player icons, whose toolbar it overlays. Not successful
    // in making the hover background color have the same transparency as bloom-player.
    // Decided to keep it as (a) it may be helping somewhat (b) it may be a necessary
    // part of a complete solution; there's an 'override' property in theme that can
    // set styles for things.
    // const theme = createMuiTheme({
    //     palette: {
    //         primary: {
    //             main: "#2e2e2e",
    //             contrastText: commonUI.colors.bloomRed,
    //         },
    //         secondary: { main: commonUI.colors.bloomRed },
    //     },
    // });
    return (
        <React.Fragment>
            <iframe
                title="bloom player"
                css={css`
                    border: none;
                    width: 100%;
                    height: 100%;
                `}
                src={iframeSrc}
                //src={"https://google.com"}
                // both of these attributes are needed to handle new and old browsers
                allow="fullscreen"
                allowFullScreen={true}
            ></iframe>
        </React.Fragment>
    );
};

function onPlayerUnloading() {
    window.screen.orientation?.unlock();
    document.exitFullscreen().catch((e) => console.log(e));
    sendPlayerClosingAnalytics();
}

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

// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, {
    useEffect,
    useCallback,
    useState,
    useRef,
    useContext,
} from "react";
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
    getContextLangIsoFromUrlSearchParams,
} from "./Routes";
import {
    sendPlayerClosingAnalytics,
    startingBook,
} from "../analytics/BloomPlayerAnalytics";
import { useMediaQuery } from "@material-ui/core";
import { OSFeaturesContext } from "./OSFeaturesContext";
import { IReadBookPageProps } from "./ReadBookPageCodeSplit";

const ReadBookPage: React.FunctionComponent<IReadBookPageProps> = (props) => {
    const id = props.id;
    const history = useHistory();
    const location = useLocation();
    const { mobile } = useContext(OSFeaturesContext);
    const widerThanPhone = useMediaQuery("(min-width:450px)"); // a bit more than the largest phone width in the chrome debugger (411px)
    const higherThanPhone = useMediaQuery("(min-height:450px)");

    // If either dimension is smaller than a phone, we'll guess we are on one
    // and go full screen automatically.
    // But we only want to do this on a mobile device. One reason is technical:
    // If the browser window were small and thus caused autoFullScreen to be true,
    // going full-screen would change the dimensions causing autoFullScreen to change to false.
    // That causes the url to change which re-renders the iframe and causes havoc. See BL-8866.
    const autoFullScreen = mobile && (!widerThanPhone || !higherThanPhone);

    const [, setCounter] = useState(0); // used to force render after going to full screen
    const [historyProblem, setHistoryProblem] = useState("normal");
    const [rotateParams, setRotateParams] = useState({
        canRotate: true,
        isLandscape: false,
    });
    const contextLangIso = getContextLangIsoFromUrlSearchParams(
        new URLSearchParams(location.search)
    );
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
                setHistoryProblem("fullScreen");
                // We are only allowed to do this this if successfully in full screen mode
                if (!canRotate) {
                    if (window.screen.orientation.lock) {
                        window.screen.orientation
                            .lock(isLandscape ? "landscape" : "portrait")
                            .catch(() => {});
                    }
                }
            })
            // If we can't do it, we can't. That's what the full screen button is for.
            // We're not allowed to go full-screen, for example, if we're starting
            // out on this page and haven't touched a button.
            .catch(() => {});
    };
    const handleMessageFromBloomPlayer = useCallback(
        (event: MessageEvent) => {
            const evtData = event.data;
            // Keep from logging errors for messages not meant for us at all.
            if (
                typeof evtData === "string" &&
                evtData.includes("messageType")
            ) {
                try {
                    const r = JSON.parse(evtData);
                    if (r.messageType === "backButtonClicked") {
                        // History.push doesn't automatically raise beforeunload, since
                        // from the browser's point of view we're staying on the same page.
                        // Easiest just to call the function we want ourselves.
                        onPlayerUnloading();
                        // We don't want to use history.goBack() because we might have
                        // come direct to the read-book page by following a URL, and
                        // we want this arrow to give us a way into the Bloom site.
                        let whereToGo = `/book/${id}`;
                        // wish all this knowledge didn't have to be here
                        if (contextLangIso) {
                            whereToGo += `?lang=${contextLangIso}`;
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
            }
        },
        [
            autoFullScreen,
            history,
            id,
            contextLangIso,
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
    const bestTitle = book ? book.getBestTitle(contextLangIso) : "Play";
    useSetBrowserTabTitle(bestTitle);

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
        )}&showBackButton=${showBackButton}&centerVertically=false&useOriginalPageSize=true&allowToggleAppBar=true` +
        `${langParam}&hideFullScreenButton=${autoFullScreen}&independent=false&host=bloomlibrary`;

    // Lint would like us to add dependencies to this, but it doesn't work if I do.
    // Not entirely sure why, but I'm at least sure this is safe, since the setHistory
    // calls form a progression that terminates: once it is in state "repaired"
    // future renders won't do anything, at least until the history problem goes away.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (
            window.history.length - history.length > 0 &&
            historyProblem === "normal"
        ) {
            console.log(
                "history problem (BL-8866) is still happening. " +
                    window.history.length +
                    " " +
                    history.length
            );
        }
        // When we automatically go to full screen and escape from it, things can be in
        // a bad state (at least in Chrome) where we have a couple of extra copies of our
        // ReadBookPage URL in history. Clicking Back will therefore not take us back.
        // Fixing this reliably is hard. We detect that it might be happening by first
        // noting that we ARE in full screen mode (above). Then we can tell we LEFT it
        // when document.fullScreenElement goes away. Since there's not much that can
        // cause us to re-render after that while the player is showing, another render
        // tyically arises from the user clicking back and it not working. So when that
        // happens, we force the browser to go back again.
        // Unfortunately we sometimes, I think because forward/back buttons moved, get
        // a render when changing the size of the window. So we only do the forced 'back'
        // if the window size hasn't changed since the last render.
        // But, we more often do NOT get a re-render when the window size changes. So
        // we can still have a single 'back' failure if the user has resized the window.
        // At least it won't take more than two clicks to get back! So far, this is the
        // best I can figure out.
        const possibleHistoryProblem =
            "leftFullScreen " +
            document.documentElement.clientWidth +
            " " +
            document.documentElement.clientHeight +
            " ";
        if (historyProblem === "fullScreen" && !document.fullscreenElement) {
            //console.log("setting historyProblem to " + possibleHistoryProblem);
            setHistoryProblem(possibleHistoryProblem + new Date().getTime());
        } else if (historyProblem.startsWith("leftFullScreen")) {
            const parts = historyProblem.split(" ");
            if (new Date().getTime() - parseInt(parts[3]) > 500) {
                // it's not the immediate re-render caused by setting it to something that starts with leftFullScreen
                if (historyProblem.startsWith(possibleHistoryProblem)) {
                    // another re-render with the exact same window dimensions is probably from calling 'back'
                    //console.log("setting to forceBack");
                    setHistoryProblem("forceBack");
                } else {
                    // update to the new dimensions (and time)
                    // console.log(
                    //     "resetting historyProblem to " + possibleHistoryProblem
                    // );
                    setHistoryProblem(
                        possibleHistoryProblem + new Date().getTime()
                    );
                }
            }
        } else if (historyProblem === "forceBack") {
            //console.log("going back");
            window.history.back();
        }
    });

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
            {url === "working" || (
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
            )}
        </React.Fragment>
    );
};

function onPlayerUnloading() {
    window.screen.orientation?.unlock();
    exitFullscreen();
    sendPlayerClosingAnalytics();
}

function exitFullscreen() {
    // Copied this logic from bloom-player's controlBar.tsx
    if (document.exitFullscreen) {
        document.exitFullscreen().catch((e) => console.log(e));
    } else if ((document as any).webkitExitFullScreen) {
        (document as any).webkitExitFullScreen(); // Safari, maybe Chrome on IOS?
    }
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

// though we normally don't like to export defaults, this is required for react.lazy (code splitting)
export default ReadBookPage;

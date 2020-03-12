let timeoutHandle: any;

// A lot of this seems overly complex but it's from some sample code I (JH) found.
// For example, in my test, it never has to retry. But maybe in a slower environment or different browser,
// it would.

// Call this after navigating back to a previous page
export function restoreScrollPosition(state: any) {
    if (Number.isFinite(state.__scrollX) && Number.isFinite(state.__scrollY)) {
        setTimeout(() =>
            tryToScrollTo({
                x: state.__scrollX,
                y: state.__scrollY,
                latestTimeToTry: Date.now() + 3000
            })
        );
    }
}
// Call this just before going on to a new page.
export function storeScrollPosition() {
    // update our current location with the current scroll position, so that if we come back
    // to it, we can restore the scroll
    window.history.replaceState(
        {
            ...window.history.state,
            __scrollX: window.scrollX,
            __scrollY: window.scrollY
        },
        window.document.title,
        window.location.href
    );
}

// Try to scroll to the scrollTarget, but only if we can actually scroll
// there. Otherwise keep trying until we time out, then scroll as far as
// we can.
function tryToScrollTo(scrollTarget: any) {
    // Stop any previous calls to "tryToScrollTo".
    clearTimeout(timeoutHandle);

    const body = document.body;
    const html = document.documentElement;

    // From http://stackoverflow.com/a/1147768
    const documentWidth = Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.clientWidth,
        html.scrollWidth,
        html.offsetWidth
    );
    const documentHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
    );

    if (
        (documentWidth - window.innerWidth >= scrollTarget.x &&
            documentHeight - window.innerHeight >= scrollTarget.y) ||
        Date.now() > scrollTarget.latestTimeToTry
    ) {
        window.scrollTo(scrollTarget.x, scrollTarget.y);
    } else {
        timeoutHandle = setTimeout(
            () => tryToScrollTo(scrollTarget),
            50 /* how often to retry*/
        );
    }
}

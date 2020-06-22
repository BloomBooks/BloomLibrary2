import React, { useEffect, useState } from "react";
// This file contains code for sending analytics information to segment.io.

// This block is boilerplate stuff from segment.io.  It is only modified by automatic line breaking and to pass typescript,
// to remove the automatic root-page notification, and to extract the line that sets the ID so we can make that configurable.
/* eslint-disable */
/* tslint:disable */
(function () {
    // tslint:disable-next-line: prefer-const
    var analytics = ((window as any).analytics =
        (window as any).analytics || []);
    if (!analytics.initialize)
        if (analytics.invoked)
            window.console &&
                console.error &&
                console.error("Segment snippet included twice.");
        else {
            analytics.invoked = !0;
            analytics.methods = [
                "trackSubmit",
                "trackClick",
                "trackLink",
                "trackForm",
                "pageview",
                "identify",
                "reset",
                "group",
                "track",
                "ready",
                "alias",
                "debug",
                "page",
                "once",
                "off",
                "on",
                "addSourceMiddleware",
                "addIntegrationMiddleware",
                "setAnonymousId",
                "addDestinationMiddleware",
            ];
            analytics.factory = function (e: any) {
                return function () {
                    var t = Array.prototype.slice.call(arguments);
                    t.unshift(e);
                    analytics.push(t);
                    return analytics;
                };
            };
            for (var e = 0; e < analytics.methods.length; e++) {
                var t = analytics.methods[e];
                analytics[t] = analytics.factory(t);
            }
            analytics.load = function (e: any, t: any) {
                var n = document.createElement("script");
                n.type = "text/javascript";
                n.async = !0;
                n.src =
                    "https://cdn.segment.com/analytics.js/v1/" +
                    e +
                    "/analytics.min.js";
                var a = document.getElementsByTagName("script")[0] as any;
                a.parentNode.insertBefore(n, a);
                analytics._loadOptions = t;
            };
            analytics.SNIPPET_VERSION = "4.1.0";
        }
})();
/* tslint:enable */
/* eslint-enable */
// Possible "sources" to send data to.
// Note that a Segment.io "source" is the (intermediate) destination that we send stuff TO.
// Development: vidljptawu, Production: a6nswpue7x, bloomlibrary test: plYUfYSopTpXkUxNpV58oGwhPNRSyBzo
// Todo: use something like this to only make analytics in production and only if user has not disabled it.
// The old code below is taken from the original BL and based on an angularjs service.
//prettier-ignore
//analytics.load(!sharedService.isProductionSite || localStorageService.get('trackLiveAnalytics') === "false" ? "vidljptawu" : "a6nswpue7x");
// This is for the segment.io 'source' "BloomLibrary Test".
// (Note: window.analytics here is typically the array created in the immediately-invokved function above
// to save events that happen before the script in that object's load method is loaded.
(window as any).analytics.load("plYUfYSopTpXkUxNpV58oGwhPNRSyBzo");
export function track(event: string, params: object) {
    // Note that once the script created in the load() function above is loaded,
    // window.analytics is an object defined in that script, not the object
    // we created in the immediately-invoked function above. So don't be tempted
    // to save that object and reuse it here.
    const analytics = (window as any).analytics;
    analytics.track(event, params);
}

// track the specified event, once when the client calling this is first loaded
// and passes sendIt true.
// (or if re-rendered with different event or params).
// The idea of sendIt is that sometimes the rules of hooks require this to be
// called in a context where we may not yet have the data we need. So just pass
// sendIt false until you do.
export function useTrack(event: string, params: object, sendIt: boolean) {
    // it's really, really hard to only send the tracking data once per
    // time we navigate to a collection. The best way I've found to guarantee it
    // is that we only send it if the params have absolutely definitely changed
    // since the last time we sent anything. We need to stringify to avoid
    // sending just because the client made a different object instance with
    // the same data, as very often happens in repeated React render calls.
    const paramsString = JSON.stringify(params);
    const [oldParamsString, setOldParamsString] = useState("");
    // typically each client render creates a new params object.
    // We only want a analytics call if it meaningfully changed.
    // Getting a different stringify should be good enough.

    useEffect(
        () => {
            if (sendIt && paramsString !== oldParamsString) {
                setOldParamsString(paramsString);
                track(event, params);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [event, paramsString, sendIt]
    );
}

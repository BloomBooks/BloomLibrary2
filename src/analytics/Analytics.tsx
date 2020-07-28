import { useEffect, useState } from "react";
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
                // Todo: currently, this file is simply the "bloomlibrary test" (plYUfYSopTpXkUxNpV58oGwhPNRSyBzo)
                // version of analytics.min.js, which would normally be obtained direct from cdn.segment.com
                // as in the comment below, using a URL that depends on our 'e' argument, the ID of the segment.IO
                // 'source' (e.g., plYUfYSopTpXkUxNpV58oGwhPNRSyBzo for bloomlibrary test).
                // We don't want to fetch it from there because segment's URLs seem to be blocked in various
                // places (e.g., PNG). So we are keeping a copy on our own server.
                // We need distinct files, downloaded from the appropriate place
                // in segment.io (see the commented out code below) for each destination (what segment.io
                // calls a source). It's not clear to me yet whether we should try to have a different
                // file with the same name in each branch (hard to prevent conflicts, and locks each branch
                // to a particular 'source'), or have three files with different names and some way
                // to choose between them here (or the code here could depend on the 'e' argument, and our caller
                // below could choose). For now we're only doing test analytics in BL2 so this is fine.
                // The old BL code switches between the three based on whether the URL is local, dev, or prod;
                // if we want to keep that we need three separate versions of analytics.min.js, and to
                // choose here which one to load.
                // Another possible ToDo is to get this asset built with a hash in its name and put it in static,
                // so clients can cache it indefinitely, but if we publish a new version it will have a new hash
                // and the new version will automatically be used. For now I'm just focusing on getting it to
                // work. But at 343K it would be nice to allow this asset to be cached.
                // Note that this version of analytics.min.js is also special (as is the one currently on
                // cdn.segment.com) in that, by our request, it sends data to analytics.bloomlibrary.org
                // which is our proxy for api.segment.io. This also helps work around segment.io being blocked.
                // We tried using a proxy to retrieve analytics.min.js, but it doesn't work, because
                // the file comes back with segment.io certificates which the browser notes are not
                // correct for a file supposedly coming from analytics-cdn.bloomlibrary.org. Possibly this
                // could be worked around with an enterprise CloudFlare subscription.
                n.src = "/analytics.min.js";
                // original version, where the current segment.io version of this lives.
                // "https://cdn.segment.com/analytics.js/v1/" +
                // e +
                // "/analytics.min.js";
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

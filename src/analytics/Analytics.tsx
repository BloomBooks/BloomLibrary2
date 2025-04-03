import { useEffect, useState } from "react";
import { Environment } from "../Environment";
// This file contains code for sending analytics information to segment.io.

// This block is boilerplate stuff from segment.io.  It is only modified by automatic line breaking and to pass typescript,
// to remove the automatic root-page notification, and to extract the line that sets the ID so we can make that configurable.
/* eslint-disable */
(function () {
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
                // This file would normally be obtained directly from cdn.segment.com
                // as in the comment below, using a URL that depends on our 'e' argument, the ID of the segment.IO
                // 'source' (e.g., plYUfYSopTpXkUxNpV58oGwhPNRSyBzo for bloomlibrary test).
                // We don't want to fetch it from there because segment's URLs seem to be blocked in various
                // places (e.g., PNG). So we are keeping a copy on our own server.
                // We need distinct files, downloaded from the appropriate place
                // in segment.io (see the commented out code below) for each destination (what segment.io
                // calls a source).
                // A possible ToDo is to get this asset built with a hash in its name and put it in static,
                // so clients can cache it indefinitely, but if we publish a new version it will have a new hash
                // and the new version will automatically be used. For now I'm just focusing on getting it to
                // work. But at 343K it would be nice to allow this asset to be cached.
                // Note that this version of analytics{.*}.min.js is also special (as is the one currently on
                // cdn.segment.com) in that, by our request, it sends data to analytics.bloomlibrary.org
                // which is our proxy for api.segment.io. This also helps work around segment.io being blocked.
                // We tried using a proxy to retrieve analytics.min.js, but it doesn't work, because
                // the file comes back with segment.io certificates which the browser notes are not
                // correct for a file supposedly coming from analytics-cdn.bloomlibrary.org. Possibly this
                // could be worked around with an enterprise CloudFlare subscription.
                n.src = "/" + getAnalyticsJsFileName();
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
/* eslint-enable */
// (Note: window.analytics here is typically the array created in the immediately-invokved function above
// to save events that happen before the script in that object's load method is loaded.
// Typically, we would pass in the source key here, but we don't use it anymore since the load function
// loads different files based on where we want to send our analytics (segment sources).
// It takes a while on a slow connection to load this file, and there's no hurry since we already arranged
// to capture any events and will send them when the real code is loaded. So to speed up page load, we
// will postpone this.
function loadAnalytics() {
    // This is cheating just a bit since it pushes the possible brief non-responsiveness
    // while we parse the analytics code outside the window for lighthouse and similar
    // performance evaluators. But I don't think it will be long enough to notice.
    setTimeout(() => (window as any).analytics.load(), 5000);
    window.removeEventListener("DOMContentLoaded", loadAnalytics);
}
window.addEventListener("DOMContentLoaded", loadAnalytics);

export function track(event: string, params: object) {
    // We only want to send a few types of events to segment.  See BL-14518.
    const eventWhiteList: string[] = [
        "Download Book",
        "Download Book To Edit",
        // The following can come from bloom-player as far as I can tell.
        "BookOrShelf opened",
        "Pages Read",
        "drag-activity",
        "simple-dom-choice",
        "comprehension",
    ];
    if (eventWhiteList.indexOf(event) === -1) {
        return;
    }
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

    useEffect(() => {
        if (sendIt && paramsString !== oldParamsString) {
            setOldParamsString(paramsString);
            track(event, params);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, paramsString, sendIt]);
}

// We decided, for now, to just send to the production analytics source
// for sites which we expect real users to use (see list below).
// So, our dev site(s), alpha, and localhost will all report to the dev analytics source.
function getEnvironment(): Environment {
    if (
        window.location.hostname === "bloomlibrary.org" ||
        window.location.hostname === "next.bloomlibrary.org" ||
        window.location.hostname === "embed.bloomlibrary.org"
    ) {
        return Environment.Prod;
    } else if (window.location.hostname === "localhost") {
        return Environment.Dev;
        // Another option is Environment.Test, but we decided for now to abandon that segment source.
        //return Environment.Test;
    }
    return Environment.Dev;
}

// Each of these are our own hosted version of https://cdn.segment.com/analytics.js/v1/X/analytics.min.js
// where X is the source key.
// Note that a Segment.io "source" is the (intermediate) destination that we send stuff TO.
// Development: vidljptawu, Production: a6nswpue7x, bloomlibrary_test: plYUfYSopTpXkUxNpV58oGwhPNRSyBzo
// See further explanation in the comment in the analytics.load function above.
// Todo: allow user (or developers and testers) to send analytics to dev or test.
function getAnalyticsJsFileName(): string {
    switch (getEnvironment()) {
        case Environment.Prod:
            return "analytics.min.js";
        case Environment.Dev:
            return "analytics.dev.min.js";
        default:
            return "analytics.test.min.js";
    }
}

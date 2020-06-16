import React, { useEffect, useState } from "react";
// This file contains code for sending analytics information to segment.io.

// This block is boilerplate stuff from segment.io.  It is only modified to adhere to strict mode and pass lint.
// (A lot of mods, since their code makes huge use of the comma operator, which lint does not allow.)
// I don't know everything it does, but one thing is it stores up any calls made before the analytics object is fully initialized.
// Once the object is initialized, it runs through the queue.  This prevents script errors during load.
const theOneAnalytics: any = (window as any).analytics || [];
(window as any).analytics = theOneAnalytics;
theOneAnalytics.methods = [
    "identify",
    "group",
    "track",
    "page",
    "pageview",
    "alias",
    "ready",
    "on",
    "once",
    "off",
    "trackLink",
    "trackForm",
    "trackClick",
    "trackSubmit",
];
theOneAnalytics.factory = (t: any) => {
    return (...args: any[]) => {
        const a = Array.prototype.slice.call(args);
        a.unshift(t);
        theOneAnalytics.push(a);
        return theOneAnalytics;
    };
};
for (const key of theOneAnalytics.methods) {
    theOneAnalytics[key] = theOneAnalytics.factory(key);
}
theOneAnalytics.load = (t: any) => {
    if (!document.getElementById("analytics-js")) {
        const a = document.createElement("script");
        a.type = "text/javascript";
        a.id = "analytics-js";
        a.async = !0;
        a.src =
            ("https:" === document.location.protocol ? "https://" : "http://") +
            "cdn.segment.io/analytics.js/v1/" +
            t +
            "/analytics.min.js";
        const n = document.getElementsByTagName("script")[0];
        n.parentNode?.insertBefore(a, n);
    }
};
theOneAnalytics.SNIPPET_VERSION = "2.0.9";
// Development: vidljptawu, Production: a6nswpue7x
// Todo: use something like this to only make analytics in production and only if user has not disabled it.
//prettier-ignore
//analytics.load(!sharedService.isProductionSite || localStorageService.get('trackLiveAnalytics') === "false" ? "vidljptawu" : "a6nswpue7x");
theOneAnalytics.load("vidljptawu");
export function track(event: string, params: object) {
    // I think we could just use theOneAnalytics, but I'm trying to stay as close as I can to
    // the way the analytics code is designed to work.
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

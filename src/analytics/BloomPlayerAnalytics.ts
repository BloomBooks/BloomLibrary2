// handle passing on analytics information obtained from Bloom Player

import { loadMainBloomAnalytics } from "./Analytics";

let theOneBloomReaderAnalytics: any;

// one-time setup to receive messages (we're interested in ones from BloomPlayer,
// though others also arrive).
window.addEventListener("message", receiveMessage, false);

export function trackForPlayer(data: any) {
    theOneBloomReaderAnalytics.track(data.event, data.params);
}

function receiveMessage(event: any) {
    try {
        const data = JSON.parse(event.data);
        switch (data.messageType) {
            case "sendAnalytics":
                trackForPlayer(data);
                break;
        }
    } catch (e) {}
}

export function beforePlayerUnloads() {
    console.log("before player unloads");
}

export function loadBpAnalytics() {
    // A dummy object set up by the main Analytics code, since this is invoked
    // BEFORE the real main analytics code executes.
    const theUsualAnalytics = (window as any).analytics;
    var n = document.createElement("script");
    n.addEventListener("load", () => {
        theOneBloomReaderAnalytics = (window as any).analytics;
        (window as any).analytics = theUsualAnalytics;
        loadMainBloomAnalytics();
    });
    n.type = "text/javascript";
    n.async = !0;
    n.src =
        "https://cdn.segment.com/analytics.js/v1/FSepBapJtfOi3FfhsEWQjc2Dw0O3ixuY/analytics.min.js";
    var a = document.getElementsByTagName("script")[0] as any;
    a.parentNode.insertBefore(n, a);
    //analytics._loadOptions = t;
}

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as Sentry from "@sentry/browser";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { createBrowserHistory } from "history";
import { isEmbedded } from "./components/EmbeddingHost";
import { initializeFirebase } from "./firebase/firebase";
import { isAppHosted } from "./components/appHosted/AppHostedUtils";

try {
    // we're sending errors so long as we're not running on localhost
    if (window.location.hostname.indexOf("bloomlibrary.org") > -1) {
        Sentry.init({
            dsn:
                "https://f33c34679bd044ba93eebb6fdf2132e3@o1009031.ingest.sentry.io/5983533",
            environment: window.location.hostname,
            attachStacktrace: true,
        });
    }
} catch (error) {
    console.error(error);
}

// supports authentication, including automatic login if a cookie supports it.
// We don't ever allow things to behave as logged-in in embedded Bloom Library instances.
// Or in app-hosted mode.
if (!isEmbedded() && !isAppHosted()) {
    initializeFirebase();
}

/*  So this is a Single Page App with an internal router. That means, e.g. bloomlibrary.org/foobar doesn't actually have a page. It's
    just supposed to go to bloomlibrary.org, find the index.htm, and the let react-router figure out what to do with "/foo".
    To make this work, in the AWS S3 bucket for this site, we tell it that if it can't find a page (e.g. "foobar") it should
    send us back to index.htm.
    And this works as far as the user sees, but this is actually throwing a 404 error which messes up Google indexing and lowers our score.
    Previously, you could see the 404 errors in the network tab if you go to page other than the home page and do a REFRESH.
    It also prevents Chrome Lighthouse from doing some accessibility inspections.
    To fix this, we have the S3 bucket taking the part after the domain name and inserting a "#!" in there, so that it looks like an anchor
    into the page, so we don't get a 404. We put this in the bucket's Redirection Rules
    <RoutingRules>
        <RoutingRule>
            <Condition>
                <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
            </Condition>
            <Redirect>
                <HostName>alpha.bloomlibrary.org</HostName>
                <ReplaceKeyPrefixWith>#!/</ReplaceKeyPrefixWith>
            </Redirect>
        </RoutingRule>
        <RoutingRule>
            <Condition>
                <HttpErrorCodeReturnedEquals>403</HttpErrorCodeReturnedEquals>
            </Condition>
            <Redirect>
                <HostName>alpha.bloomlibrary.org</HostName>
                <ReplaceKeyPrefixWith>#!/</ReplaceKeyPrefixWith>
            </Redirect>
        </RoutingRule>
    </RoutingRules>
    You can see the whole S3 bucket setup here: https://i.imgur.com/mLgf0Gk.png
    Then this code removes that /#!/ so we are back to a simple bloomlibrary.og/foobar.
    This technique is described here: https://viastudio.com/hosting-a-reactjs-app-with-routing-on-aws-s3/
*/
const history = createBrowserHistory();
const path = (/#!(\/.*)$/.exec(window.location.hash) || [])[1];
if (path) {
    history.replace(path);
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as Sentry from "@sentry/browser";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { createBrowserHistory } from "history";
import { isEmbedded } from "./components/Embedding/EmbeddingHost";
import { initializeFirebase } from "./authentication/firebase/firebase";
import { isAppHosted } from "./components/appHosted/AppHostedUtils";

// Google Translate can often break react sites. See https://issues.chromium.org/issues/41407169.
// We seem to be hitting this mostly (exclusively?) because of our use of react-truncate-markup.
// See issue at https://github.com/patrik-piskay/react-truncate-markup/issues/65.
// React itself proposes the patch below (see https://github.com/facebook/react/issues/11538#issuecomment-417504600):
if (typeof Node === "function" && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
        if (child.parentNode !== this) {
            if (console) {
                console.error(
                    "Cannot remove a child from a different parent",
                    child,
                    this
                );
            }
            return child;
        }
        return originalRemoveChild.call(this, child) as T;
    };
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(
        newNode: T,
        referenceNode: Node | null
    ): T {
        if (referenceNode && referenceNode.parentNode !== this) {
            if (console) {
                console.error(
                    "Cannot insert before a reference node from a different parent",
                    referenceNode,
                    this
                );
            }
            return newNode;
        }
        return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
}
// End patch for Google Translate

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

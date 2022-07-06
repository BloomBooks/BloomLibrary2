// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// This file exports some constants and functions that are useful in various places where
// BloomLibrary behaves differently when embedded in an app (currently BloomReader).

// If we're constructing an app-hosted URL, this is what we insert.
// we're including a v1 in case we one day need a later version of this.
export const appHostedMarker = "app-hosted-v1";

// If this prefix is found in a URL, we're in app-hosted mode.
export function useIsAppHosted() {
    const location = useLocation();
    return location.pathname.startsWith("/app-hosted-");
}

// Return the equivalent URL path not in the app-hosted space.
// If necessary we could make this smarter about working with any version.
export function removeAppHostedFromPath(path: string): string {
    return path.replace("/" + appHostedMarker + "/", "/");
}

import React from "react";

export const bloomDesktopAvailable =
    navigator.appVersion.indexOf("Win") >= 0 ||
    navigator.appVersion.indexOf("Linux") >= 0;
export const bloomReaderAvailable =
    navigator.appVersion.indexOf("Android") >= 0;
// This context allows anyone interested to find out whether the OS on which the
// user is running has support for bloom desktop (e.g., to hide a download/translate
// button) and whether it has bloomReader support (and so downloading for that should
// be prominent).
export const OSFeaturesContext = React.createContext<{
    bloomDesktopAvailable: boolean;
    bloomReaderAvailable: boolean;
}>({
    bloomDesktopAvailable,
    bloomReaderAvailable
});

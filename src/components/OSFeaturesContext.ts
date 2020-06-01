import React from "react";

export const bloomDesktopAvailable =
    (navigator.appVersion.indexOf("Win") >= 0 ||
        navigator.appVersion.indexOf("Linux") >= 0) &&
    // Running on Android will also include "Linux"
    navigator.appVersion.indexOf("Android") < 0;

export const bloomReaderAvailable =
    navigator.appVersion.indexOf("Android") >= 0;
// From discussion at https://stackoverflow.com/questions/9038625/detect-if-device-is-ios.
// This will NOT detect an ipad running IOS 13 in desktop mode, which is probably what we
// want, since the current application is hiding the bloomd download on non-desktop devices
// that can't use it themselves.
const ios = /^(iPhone|iPad|iPod)/.test(navigator.platform);
// This is simplistic. In some senses anything but Android can't use BloomD files
// at present, but we're taking the general approach that desktops can reasonably
// download them to share or post or similar. We could try various more sophisticated
// ways (see e.g. https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser)
// to detect that we're running on a non-Android mobile device, but they are complex
// and ever-changing. And currently all we're doing is hiding a button, so it's not all
// that important to do so on every possible mobile device. Of course, we REALLY
// don't want to prevent downloading a bloomd on anything that can run BloomReader,
// but cantUseBloomD is currently only relevant if bloomReaderAvailable is false.
export const cantUseBloomD = ios;
// This context allows anyone interested to find out whether the OS on which the
// user is running has support for bloom desktop (e.g., to hide a download/translate
// button) and whether it has bloomReader support (and so downloading for that should
// be prominent).
export const OSFeaturesContext = React.createContext<{
    bloomDesktopAvailable: boolean;
    bloomReaderAvailable: boolean;
    cantUseBloomD: boolean;
}>({
    bloomDesktopAvailable,
    bloomReaderAvailable,
    cantUseBloomD,
});

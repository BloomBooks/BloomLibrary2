import React from "react";

const windows = navigator.appVersion.indexOf("Win") >= 0;
const android = navigator.appVersion.indexOf("Android") >= 0;
const chromeOS = navigator.userAgent.indexOf("CrOS") >= 0;
// Linux Firefox does not include "Linux" in appVersion (BL-9728)
// Running on Android or ChromeOS will also include "Linux" in appVersion or platform.
const linux =
    (navigator.appVersion.indexOf("Linux") >= 0 ||
        navigator.platform?.startsWith("Linux")) &&
    !android &&
    !chromeOS;
export const bloomDesktopAvailable = windows || linux;

export const bloomReaderAvailable = android;
// From discussion at https://stackoverflow.com/questions/9038625/detect-if-device-is-ios.
// This will NOT detect an ipad running IOS 13 in desktop mode, which is probably what we
// want, since the current application is hiding the bloomd download on non-desktop devices
// that can't use it themselves.
const ios = /^(iPhone|iPad|iPod)/.test(navigator.platform);
// When testing with Chrome's device toolbar on Windows, the above ios will be false even though
// Chrome is 'simulating' an iPhone/iPad. The following will show if we are testing them in Chrome.
// UserAgent=Mozilla/5.0 (iPhone...
const testingMobileIos = /\((iPhone|iPad|iPod)/.test(navigator.userAgent);
// This is simplistic. In some senses anything but Android can't use BloomD files
// at present, but we're taking the general approach that desktops can reasonably
// download them to share or post or similar. We could try various more sophisticated
// ways (see e.g. https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser)
// to detect that we're running on a non-Android mobile device, but they are complex
// and ever-changing. And currently all we're doing is hiding a button, so it's not all
// that important to do so on every possible mobile device. Of course, we REALLY
// don't want to prevent downloading a bloomd on anything that can run BloomReader,
// but cantUseBloomD is currently only relevant if bloomReaderAvailable is false.
export const cantUseBloomD = ios || testingMobileIos;
// We hide disabled download buttons on mobile (touch) devices because it not
// easily discoverable why a button is disabled.
export const mobile = android || ios || testingMobileIos;
// This context allows anyone interested to find out whether the OS on which the
// user is running has support for bloom desktop (e.g., to hide a download/translate
// button) and whether it has bloomReader support (and so downloading for that should
// be prominent).
export const OSFeaturesContext = React.createContext<{
    bloomDesktopAvailable: boolean;
    bloomReaderAvailable: boolean;
    cantUseBloomD: boolean;
    mobile: boolean;
}>({
    bloomDesktopAvailable,
    bloomReaderAvailable,
    cantUseBloomD,
    mobile,
});

export const OSFeaturesProvider: React.FunctionComponent = (props) => {
    return (
        <OSFeaturesContext.Provider
            value={{
                bloomDesktopAvailable,
                bloomReaderAvailable,
                cantUseBloomD,
                mobile,
            }}
        >
            {props.children}
        </OSFeaturesContext.Provider>
    );
};

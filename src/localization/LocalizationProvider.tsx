import React, { useState } from "react";
import { IntlProvider } from "react-intl";
import { useGetLocalizations } from "./GetLocalizations";

let setLanguageOverride: (tag: string) => void = () => {};
export { setLanguageOverride };

// This component sets up the react-intl <IntlProvider> to use our translations. The guts of the app should be given as its children
export const LocalizationProvider: React.FunctionComponent<{}> = (props) => {
    const [uilang, setUilang] = useState(getTopBrowserUILanguage());
    setLanguageOverride = setUilang;
    console.log("uilang is " + uilang);
    // //If you add `?uilang=<code>` to the url, BloomLibrary should attempt to show the UI in that language. E.g., `?uilang=es` will show Spanish.
    // const uilang =
    //     languageTagOverride || //new URLSearchParams(window.location.search).get("uilang") ||
    //     getTopBrowserUILanguage();

    // Enhance: this assumes that for each string, you get it in that language or if we don't have
    // a translation for it yet, then you get it in English.
    // We could do better by doing our best for each string. We could give you the string in the language
    // that best meets your needs according to your browser settings, which has an ordered list of languages.
    const {
        closestLanguage: languageTagWeAreUsing,
        stringsForThisLanguage,
    } = useGetLocalizations(uilang);
    // console.log(
    //     "stringsForThisLanguage:" +
    //         JSON.stringify(stringsForThisLanguage, null, 4)
    // );
    const slowerLanguageLookupToHelpErrorChecking =
        window.location.hostname === "alpha.bloomlibrary.org" ||
        window.location.hostname === "dev-alpha.bloomlibrary.org" ||
        window.location.hostname === "localhost";

    const waitingForLocalizations = stringsForThisLanguage === undefined;
    const stringIDsThatWeHaveAlreadyWarnedAbout: string[] = [];
    return (
        <IntlProvider
            locale={languageTagWeAreUsing}
            messages={stringsForThisLanguage}
            defaultLocale={
                slowerLanguageLookupToHelpErrorChecking ? "qaa" : undefined
            }
            onError={(s: any) => {
                // TODO this isn't working yet. The idea is to only print a message for the dev if we're in english and it looks
                // like we haven't registered the string in the "Code Strings.json" file.
                if (s.code === "MISSING_TRANSLATION") {
                    if (
                        languageTagWeAreUsing === "en" &&
                        !stringIDsThatWeHaveAlreadyWarnedAbout.includes(
                            s.descriptor.id
                        )
                    ) {
                        stringIDsThatWeHaveAlreadyWarnedAbout.push(
                            s.descriptor.id
                        );
                        if (
                            s.descriptor.id.indexOf("collection.") === -1 &&
                            s.descriptor.id.indexOf("banner.") === -1 &&
                            s.descriptor.id.indexOf("topic.") === -1
                        ) {
                            console.warn(
                                `Add Message to Code Strings.json:\n
                                    "${s.descriptor.id}":{
                                        "message":"${
                                            s.descriptor.defaultMessage
                                        }"
                                    ${
                                        s.descriptor.description
                                            ? `, "description":"${s.descriptor.description}"`
                                            : ""
                                    }}`
                            );
                        }
                    } else {
                        console.info(
                            `Missing translation for '${s.descriptor.id}' in ${languageTagWeAreUsing}`
                        );
                    }
                } else {
                    console.error(`${JSON.stringify(s)}`);
                }
            }}
        >
            {/* Getting the localizations happens asynchronously. We could show English while we're waiting. We could
            show whatever strings have come in translated, while we're waiting for other string files to arrive. Instead,
            We decided to not show anything until we have all localizations, or decided to fall back to English. This
            then allows us to make the simplifying assumption in  the rest of the UI code that we do not need to be
            able to re-render when/if the localization data arrives. We can still re-render if setUILang() is called.
            That assumption, in turn, solves the problem of getting localizations from functions which are not hooks.

            This delay in rendering is also an optimization, because else we could be re-rendering for each l10n file
            (currently there are 5). */}
            {waitingForLocalizations
                ? "Loading translations..."
                : props.children}
        </IntlProvider>
    );
};

function getTopBrowserUILanguage(): string {
    return navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language ?? "en";
}

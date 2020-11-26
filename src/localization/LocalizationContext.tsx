import React from "react";
import { IntlProvider } from "react-intl";
import { useGetLocalizations } from "./GetLocalizations";

// This component sets up the react-intl <IntlProvider> to use our translations. The guts of the app should be given as its children
export const LocalizationContext: React.FunctionComponent<{}> = (props) => {
    //If you add `?uilang=<code>` to the url, BloomLibrary should attempt to show the UI in that language. E.g., `?uilang=es` will show Spanish.
    const uilang =
        new URLSearchParams(window.location.search).get("uilang") ||
        getTopBrowserUILanguage();

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
                    if (languageTagWeAreUsing === "en") {
                        //if (Object.keys(stringsForThisLanguage).length > 0) {
                        // console.info(
                        //     `Add Message to Code Strings.json:\n"
                        //     "${s.descriptor.id}":{"message":"${
                        //         s.descriptor.defaultMessage
                        //     }"
                        //     ${
                        //         s.descriptor.description
                        //             ? `, "description":"${s.descriptor.description}"`
                        //             : ""
                        //     }}`
                        // );
                        //}
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
            {props.children}
        </IntlProvider>
    );
};

function getTopBrowserUILanguage(): string {
    return navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language ?? "en";
}
